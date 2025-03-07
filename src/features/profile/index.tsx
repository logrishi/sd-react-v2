import { type FC } from "@/lib/vendors";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Separator } from "@/components/common/ui/separator";
import { Switch } from "@/components/common/ui/switch";
import { store } from "@/services/store";
import { useState, useEffect } from "react";
import { Mail, User, Lock, Shield, HelpCircle, ExternalLink, PencilLine, Camera, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/common/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/common/ui/alert-dialog";
import { getEnvVar } from "@/lib/utils/env-vars";
import { navigateTo } from "@/lib/utils/navigate-to";

const Profile: FC = () => {
  const navigate = useNavigate();
  const { user = { name: "", email: "", image: "" }, isLoggedIn = false } = store.auth.get() ?? {};

  // Redirect if not logged in
  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     navigate("/login");
  //   }
  // }, [isLoggedIn, navigate]);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // TODO: Implement profile update
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement avatar upload
      const tempUrl = URL.createObjectURL(file);
      // setAvatarUrl(tempUrl);
    }
  };

  const handleLogout = () => {
    store.auth.set({
      isLoggedIn: false,
      user: { name: "", email: "", image: "" },
      session: null,
      isAdmin: false,
      expiryDate: null,
      updatePassword: false,
      forcePasswordReset: false,
      forceLogout: false,
      lastLogin: null,
    });
    navigate("/login");
  };

  if (!isLoggedIn) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>You will need to login again to access your account.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="relative">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setIsEditing(!isEditing)}
          className="absolute right-4 top-4 h-8 w-8 bg-muted hover:bg-muted/80"
        >
          <PencilLine className="h-4 w-4 text-primary" />
        </Button>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and how we can reach you</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center justify-center min-h-[180px] space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {user.image ? (
                    <AvatarImage src={`${getEnvVar("VITE_IMAGE_URL")}/${user.image}`} alt={user.name} />
                  ) : (
                    <AvatarFallback className="text-lg font-bold">
                      {user.name?.split(" ").length > 1
                        ? `${user.name.split(" ")[0][0]}${user.name.split(" ").pop()?.[0]}`.toUpperCase()
                        : user.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isEditing && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 translate-y-1/3 translate-x-1/4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary hover:bg-primary/90 shadow-md z-10"
                  >
                    <Camera className="h-4 w-4 text-primary-foreground" />
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditing && (
                <p className="text-sm text-muted-foreground text-center">
                  Click the camera icon to upload a new profile picture
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-l-md bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  placeholder="Full Name"
                  disabled={!isEditing}
                  className="pl-12"
                />
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-l-md bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  placeholder="Email"
                  disabled={!isEditing}
                  className="pl-12"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security and privacy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <Label>Password</Label>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/password-reset")}>
              Change Password
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <Label>Privacy Policy</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Read our privacy policy to understand how we handle your data
            </p>
            <Button variant="link" className="px-0" asChild>
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                View Privacy Policy <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Get help with your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <Label>Need Help?</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            If you're having trouble with your account or have questions, our support team is here to help
          </p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
            <Button variant="link" className="w-full">
              View FAQs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
