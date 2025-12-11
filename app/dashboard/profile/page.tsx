import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Shield, Flame, Award, Settings, Bell, Trash2 } from "lucide-react";

// Mock data - replace with real data from your backend
const userProfile = {
  verified: true,
  birthDate: "January 1, 1990",
  gender: "Prefer not to say",
  zipCode: "10001",
  email: "user@example.com",
};

const userStats = {
  streak: 7,
  totalAnswered: 42,
  badges: [
    { name: "7-day streak", icon: Flame },
    { name: "First week", icon: Award },
  ],
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
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
                <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
                <span className="text-sm text-muted-foreground">
                  on December 1, 2025
                </span>
              </div>
              <Separator />
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Birth Date
                  </label>
                  <p className="mt-1">{userProfile.birthDate}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This field cannot be changed after verification
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Gender
                  </label>
                  <p className="mt-1">{userProfile.gender}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This field cannot be changed after verification
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Zip Code</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={userProfile.zipCode}
                      className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                    <Button size="sm">Update</Button>
                  </div>
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

