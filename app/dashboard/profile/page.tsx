"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Shield, Flame, Award, Settings, Bell, Trash2, Loader2, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { format } from "date-fns";

// User data type
interface UserData {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  zipCode?: string;
  verified?: boolean;
  verifiedAt?: string;
  email?: string;
}

// Mock stats - replace with real data from your backend
const userStats = {
  streak: 7,
  totalAnswered: 42,
  badges: [
    { name: "7-day streak", icon: Flame },
    { name: "First week", icon: Award },
  ],
};

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingZipCode, setEditingZipCode] = useState(false);
  const [zipCodeValue, setZipCodeValue] = useState("");
  const [savingZipCode, setSavingZipCode] = useState(false);

  // Fetch user data from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          // Fetch user data from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData({
              ...data,
              email: user.email || undefined,
            } as UserData);
            setZipCodeValue(data.zipCode || "");
          } else {
            // User document doesn't exist yet (shouldn't happen if they completed verification)
            setUserData({
              email: user.email || undefined,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Not authenticated, redirect to login
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateZipCode = async () => {
    if (!isAuthenticated || !auth.currentUser) return;

    setSavingZipCode(true);
    try {
      const user = auth.currentUser;
      await setDoc(
        doc(db, "users", user.uid),
        {
          zipCode: zipCodeValue,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update local state
      setUserData((prev) => ({
        ...prev,
        zipCode: zipCodeValue,
      }));

      setEditingZipCode(false);
    } catch (error) {
      console.error("Error updating zip code:", error);
      alert("Failed to update zip code. Please try again.");
    } finally {
      setSavingZipCode(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  // Format birth date for display
  const formatBirthDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  // Format gender for display
  const formatGender = (gender?: string) => {
    if (!gender) return "N/A";
    const genderMap: Record<string, string> = {
      male: "Male",
      female: "Female",
      "non-binary": "Non-binary",
      "prefer-not-to-say": "Prefer not to say",
    };
    return genderMap[gender] || gender;
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your identity, view your stats, and adjust settings
        </p>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.streak} days</div>
                <p className="text-xs text-muted-foreground">Keep it going!</p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Answered</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalAnswered}</div>
                <p className="text-xs text-muted-foreground">Questions answered</p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                <Award className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.badges.length}</div>
                <p className="text-xs text-muted-foreground">Achievements unlocked</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
              <CardDescription>Participation achievements you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {userStats.badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.name}
                      className="flex items-center gap-2 rounded-lg border p-3"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity" className="space-y-4">
          <Card className="shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Verification Status</CardTitle>
              </div>
              <CardDescription>
                Your identity is verified to ensure data integrity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {userData?.verified ? (
                  <>
                    <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                    {userData.verifiedAt && (
                      <span className="text-sm text-muted-foreground">
                        on {formatDate(userData.verifiedAt)}
                      </span>
                    )}
                  </>
                ) : (
                  <Badge variant="secondary">Not Verified</Badge>
                )}
              </div>
              <Separator />
              <div className="space-y-4">
                {userData?.fullName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <p className="mt-1">{userData.fullName}</p>
                  </div>
                )}
                {userData?.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="mt-1">{userData.email}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Birth Date
                  </label>
                  <p className="mt-1">{formatBirthDate(userData?.birthDate)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This field cannot be changed after verification
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Gender
                  </label>
                  <p className="mt-1">{formatGender(userData?.gender)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This field cannot be changed after verification
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Zip Code</label>
                  <div className="mt-2 flex items-center gap-2">
                    {editingZipCode ? (
                      <>
                        <Input
                          type="text"
                          value={zipCodeValue}
                          onChange={(e) => setZipCodeValue(e.target.value)}
                          placeholder="10001"
                          maxLength={5}
                          pattern="[0-9]{5}"
                          className="w-32"
                          disabled={savingZipCode}
                        />
                        <Button
                          size="sm"
                          onClick={handleUpdateZipCode}
                          disabled={savingZipCode || zipCodeValue.length !== 5}
                        >
                          {savingZipCode ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingZipCode(false);
                            setZipCodeValue(userData?.zipCode || "");
                          }}
                          disabled={savingZipCode}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="mt-1">{userData?.zipCode || "Not set"}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingZipCode(true);
                            setZipCodeValue(userData?.zipCode || "");
                          }}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for demographic analysis. Can be updated later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage how you receive daily reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive daily question reminders via email
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Browser Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified at 9 AM local time
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Privacy</CardTitle>
              </div>
              <CardDescription>
                Learn how we protect your anonymity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Civie logs that you answered, not what you chose. Your responses are only
                stored as aggregate counters. No response-level PII is ever stored.
              </p>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                <CardTitle>Sign Out</CardTitle>
              </div>
              <CardDescription>
                Sign out of your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You can sign back in at any time using your email.
              </p>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

