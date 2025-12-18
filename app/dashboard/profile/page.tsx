"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Shield, Flame, Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged } from "@/lib/firebase";
import { format } from "date-fns";
import { useUserData, UserData } from "@/hooks/use-user-data";
import { calculateUserStats } from "@/lib/question-utils";

export default function ProfilePage() {
  const router = useRouter();
  const { userData: hookUserData, loading: hookLoading } = useUserData();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingZipCode, setEditingZipCode] = useState(false);
  const [zipCodeValue, setZipCodeValue] = useState("");
  const [savingZipCode, setSavingZipCode] = useState(false);
  const [editingPhoneNumber, setEditingPhoneNumber] = useState(false);
  const [phoneNumberValue, setPhoneNumberValue] = useState("");
  const [savingPhoneNumber, setSavingPhoneNumber] = useState(false);
  
  // Notification preferences state (default to all enabled)
  const [notifications, setNotifications] = useState({
    email: {
      questionAlert: true,
      dailyReminder: true,
    },
    sms: {
      questionAlert: true,
      dailyReminder: true,
    },
  });

  // Fetch user data from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          // Use data from hook if available, otherwise fetch directly
          if (hookUserData) {
            setUserData(hookUserData as UserData);
            setZipCodeValue(hookUserData.zipCode || "");
            // Use phone number from Firestore, or fallback to Firebase Auth
            const phoneNumber = hookUserData.phoneNumber || user.phoneNumber || "";
            setPhoneNumberValue(phoneNumber);
            
            // Load notification preferences (default to all enabled if not set)
            if (hookUserData.notifications) {
              setNotifications({
                email: {
                  questionAlert: hookUserData.notifications.email?.questionAlert ?? true,
                  dailyReminder: hookUserData.notifications.email?.dailyReminder ?? true,
                },
                sms: {
                  questionAlert: hookUserData.notifications.sms?.questionAlert ?? true,
                  dailyReminder: hookUserData.notifications.sms?.dailyReminder ?? true,
                },
              });
            } else {
              // If no preferences exist, they default to all enabled (already set in state)
              // But we should save them to Firestore for consistency
              const defaultNotifications = {
                email: {
                  questionAlert: true,
                  dailyReminder: true,
                },
                sms: {
                  questionAlert: true,
                  dailyReminder: true,
                },
              };
              await setDoc(
                doc(db, "users", user.uid),
                {
                  notifications: defaultNotifications,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            }
            setLoading(false);
          } else {
            // Fallback: fetch directly if hook data not available
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData({
              ...data,
              email: user.email || undefined,
              // Use phone number from Firestore, or fallback to Firebase Auth
              phoneNumber: data.phoneNumber || user.phoneNumber || undefined,
            } as UserData);
            setZipCodeValue(data.zipCode || "");
            setPhoneNumberValue(data.phoneNumber || user.phoneNumber || "");
              
              // Load notification preferences
              if (data.notifications) {
                setNotifications({
                  email: {
                    questionAlert: data.notifications.email?.questionAlert ?? true,
                    dailyReminder: data.notifications.email?.dailyReminder ?? true,
                  },
                  sms: {
                    questionAlert: data.notifications.sms?.questionAlert ?? true,
                    dailyReminder: data.notifications.sms?.dailyReminder ?? true,
                  },
                });
              }
          } else {
            setUserData({
              email: user.email || undefined,
            });
            }
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoading(false);
        }
      } else {
        // Not authenticated, redirect to login
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router, hookUserData]);

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

  const handleUpdatePhoneNumber = async () => {
    if (!isAuthenticated || !auth.currentUser) return;

    setSavingPhoneNumber(true);
    try {
      const user = auth.currentUser;
      // Normalize phone number (basic validation - you may want to enhance this)
      const normalizedPhone = phoneNumberValue.trim();
      
      // Basic validation - should start with + and have digits
      if (normalizedPhone && !normalizedPhone.startsWith('+')) {
        alert("Phone number must be in international format (e.g., +1234567890)");
        setSavingPhoneNumber(false);
        return;
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          phoneNumber: normalizedPhone || null,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update local state
      setUserData((prev) => ({
        ...prev,
        phoneNumber: normalizedPhone || undefined,
      }));

      setEditingPhoneNumber(false);
    } catch (error) {
      console.error("Error updating phone number:", error);
      alert("Failed to update phone number. Please try again.");
    } finally {
      setSavingPhoneNumber(false);
    }
  };

  const handleNotificationChange = async (
    type: "email" | "sms",
    preference: "questionAlert" | "dailyReminder",
    value: boolean
  ) => {
    if (!isAuthenticated || !auth.currentUser) return;

    const updatedNotifications = {
      ...notifications,
      [type]: {
        ...notifications[type],
        [preference]: value,
      },
    };

    setNotifications(updatedNotifications);

    try {
      const user = auth.currentUser;
      await setDoc(
        doc(db, "users", user.uid),
        {
          notifications: updatedNotifications,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update local state
      setUserData((prev) => ({
        ...prev,
        notifications: updatedNotifications,
      }));
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      // Revert on error
      setNotifications(notifications);
      alert("Failed to update notification preferences. Please try again.");
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

  // Format birth date for display - handle timezone issues
  const formatBirthDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      // Parse YYYY-MM-DD format directly to avoid timezone issues
      // Split the date string and create a date in local timezone
      const [year, month, day] = dateString.split("-").map(Number);
      if (year && month && day) {
        const date = new Date(year, month - 1, day); // month is 0-indexed
        return format(date, "MMMM d, yyyy");
      }
      // Fallback to regular date parsing
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

  // Format race/ethnicity for display
  const formatRaceEthnicity = (raceEthnicity?: string) => {
    if (!raceEthnicity) return "N/A";
    const raceMap: Record<string, string> = {
      "american-indian-alaska-native": "American Indian or Alaska Native",
      "asian": "Asian",
      "black-african-american": "Black or African American",
      "hispanic-latino": "Hispanic or Latino",
      "middle-eastern-north-african": "Middle Eastern or North African",
      "native-hawaiian-pacific-islander": "Native Hawaiian or Other Pacific Islander",
      "white": "White",
      "multiracial": "Multiracial",
      "other": "Other",
      "prefer-not-to-say": "Prefer not to say",
    };
    return raceMap[raceEthnicity] || raceEthnicity;
  };

  // Calculate stats from user answers
  const userStats = calculateUserStats(hookUserData?.answers);

  if (loading || hookLoading) {
    return (
      <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Profile</h1>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>
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
                    <Input
                      type="text"
                      value={userData.fullName}
                      readOnly
                      className="mt-1 bg-muted shadow-none"
                    />
                  </div>
                )}
                {userData?.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={userData.email}
                      readOnly
                      className="mt-1 bg-muted shadow-none"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Birth Date
                  </label>
                  <Input
                    type="text"
                    value={formatBirthDate(userData?.birthDate)}
                    readOnly
                    className="mt-1 bg-muted shadow-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Gender
                  </label>
                  <Input
                    type="text"
                    value={formatGender(userData?.gender)}
                    readOnly
                    className="mt-1 bg-muted shadow-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Race/Ethnicity
                  </label>
                  <Input
                    type="text"
                    value={formatRaceEthnicity(userData?.raceEthnicity)}
                    readOnly
                    className="mt-1 bg-muted shadow-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Zip Code</label>
                  <div className="mt-1 flex items-center gap-2">
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
                        <Input
                          type="text"
                          value={userData?.zipCode || "Not set"}
                          readOnly
                          className="bg-muted flex-1 shadow-none"
                        />
                        <Button
                          variant="outline"
                          className="shadow-none"
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
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <div className="mt-1 flex items-center gap-2">
                    {editingPhoneNumber ? (
                      <>
                        <Input
                          type="tel"
                          value={phoneNumberValue}
                          onChange={(e) => setPhoneNumberValue(e.target.value)}
                          placeholder="+1234567890"
                          className="flex-1"
                          disabled={savingPhoneNumber}
                        />
                        <Button
                          size="sm"
                          onClick={handleUpdatePhoneNumber}
                          disabled={savingPhoneNumber}
                        >
                          {savingPhoneNumber ? (
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
                            setEditingPhoneNumber(false);
                            setPhoneNumberValue(userData?.phoneNumber || "");
                          }}
                          disabled={savingPhoneNumber}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Input
                          type="tel"
                          value={userData?.phoneNumber || "Not set"}
                          readOnly
                          className="bg-muted flex-1 shadow-none"
                        />
                        <Button
                          variant="outline"
                          className="shadow-none"
                          onClick={() => {
                            setEditingPhoneNumber(true);
                            setPhoneNumberValue(userData?.phoneNumber || "");
                          }}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for SMS notifications. Use international format (e.g., +1234567890). Notifications are sent daily at 9:05 AM UTC.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="shadow-none">
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive daily reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <h3 className="font-medium">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-question-alert" className="text-sm font-normal cursor-pointer">
                        New question alert
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when today&apos;s question becomes available
                      </p>
                    </div>
                    <Switch
                      id="email-question-alert"
                      checked={notifications.email.questionAlert}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("email", "questionAlert", checked)
                      }
                    />
                  </div>
              <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-daily-reminder" className="text-sm font-normal cursor-pointer">
                        Daily reminder
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Reminder to answer if you haven&apos;t yet
                      </p>
                    </div>
                    <Switch
                      id="email-daily-reminder"
                      checked={notifications.email.dailyReminder}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("email", "dailyReminder", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* SMS Notifications */}
              <div className="space-y-4">
                <h3 className="font-medium">SMS Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-question-alert" className="text-sm font-normal cursor-pointer">
                        New question alert
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when today&apos;s question becomes available
                      </p>
                    </div>
                    <Switch
                      id="sms-question-alert"
                      checked={notifications.sms.questionAlert}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("sms", "questionAlert", checked)
                      }
                    />
                  </div>
              <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-daily-reminder" className="text-sm font-normal cursor-pointer">
                        Daily reminder
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Reminder to answer if you haven&apos;t yet
                      </p>
                    </div>
                    <Switch
                      id="sms-daily-reminder"
                      checked={notifications.sms.dailyReminder}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("sms", "dailyReminder", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive shadow-none">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="destructive" size="sm" disabled>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

