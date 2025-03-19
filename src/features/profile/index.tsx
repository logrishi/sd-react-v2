import { type FC } from "@/lib/vendors";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Separator } from "@/components/common/ui/separator";
import { store } from "@/services/store";
import { useState, useEffect } from "react";
import {
  Mail,
  User,
  Lock,
  Shield,
  HelpCircle,
  ExternalLink,
  PencilLine,
  Camera,
  LogOut,
  Loader2,
  Clock,
  Check,
  X,
  MessageCircle,
  MessageCircleQuestion,
} from "@/assets/icons";
import Pay from "@/features/pay";
import AccessMessage from "@/components/common/access-message";
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
import { Badge } from "@/components/common/ui/badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getEnvVar } from "@/lib/utils/env-vars";
import { handleLogout, updateUser, uploadMedia } from "@/services/backend/actions";
import { APP_VERSION, EMAIL, WHATSAPP_NUMBER } from "@/lib/utils/constants";

dayjs.extend(relativeTime);

const Profile: FC = () => {
  const navigate = useNavigate();
  const {
    user = { id: "", name: "", email: "", image: "" },
    isLoggedIn = false,
    isSubscribed = false,
    isSubscriptionExpired = false,
    expiryDate = null,
  } = store.auth.get() ?? {};
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const handleContactSupport = () => {
    window.location.href = `mailto:${EMAIL}`;
  };

  // No longer redirecting when not logged in

  // Cleanup avatar preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;

      // Input validation
      if (!name?.trim()) {
        setError("Please enter your name");
        setLoading(false);
        return;
      }

      let imageUrl = user.image;

      // Handle avatar upload if changed
      if (avatarFile) {
        try {
          // Compress image before upload
          const uploadResponse = await uploadMedia(avatarFile, "users");
          console.log("uploadResponse", uploadResponse);
          if (uploadResponse?.files?.image) {
            imageUrl = uploadResponse.files.image;
            // imageUrl = uploadResponse.path.replace(`${getEnvVar("VITE_IMAGE_URL")}/`, "");
          } else {
            throw new Error("Upload response is missing image path");
          }
        } catch (error) {
          console.error("Error uploading avatar:", error);
          setError("Failed to upload avatar. Please try again.");
          return;
        }
      }

      // Update user profile in backend - only send name and image
      const updateResponse = await updateUser(user.id, {
        name,
        image: imageUrl,
      });

      if (updateResponse.err) {
        throw new Error("Failed to update profile");
      }

      // Update local store after successful backend update
      const currentAuth = store.auth.get();
      store.auth.set({
        ...currentAuth,
        user: {
          ...currentAuth.user,
          name,
          image: imageUrl,
        },
      });

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Cleanup previous preview
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }

      // Create new preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
      setError(""); // Clear any previous errors
    }
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate("/login");
  };

  if (!isLoggedIn) {
    return (
      <div className="container max-w-4xl py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>

        <Card className="p-6">
          <AccessMessage isLoggedIn={false} isSubscribed={false} isSubscriptionExpired={false} />
        </Card>

        {/* Personal Information - Locked */}
        <Card className="relative">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle>Personal Information</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Login to access and manage your personal details</CardDescription>
          </CardHeader>
        </Card>

        {/* Subscription Status - Locked */}
        <Card className="relative">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle>Subscription Status</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Login to view your subscription details</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <CardDescription>Read our privacy policy to understand how we handle your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Button variant="link" className="px-0" asChild onClick={() => navigate("/privacy")}>
                <p className="text-sm">
                  View Privacy Policy <ExternalLink className="ml-1 h-4 w-4" />
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>Get help with your account or technical issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Need assistance? Our support team is here to help you with any questions or concerns.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open("https://wa.me/" + WHATSAPP_NUMBER, "_blank")}
                >
                  <MessageCircleQuestion className="h-4 w-4" /> Contact on WhatsApp
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleContactSupport}>
                  <Mail className="h-4 w-4" /> Email Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Manage your account settings and preferences</p>
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
                onClick={handleLogoutClick}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="relative mb-8">
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
                  <AvatarImage
                    src={
                      avatarPreview ? avatarPreview : user.image ? `${getEnvVar("VITE_IMAGE_URL")}/${user.image}` : ""
                    }
                    alt={user.name}
                    className="object-cover"
                    onLoadStart={() => setImageLoading(true)}
                    onLoad={() => setImageLoading(false)}
                    onError={(e) => {
                      setImageLoading(false);
                      // Hide broken image icon
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <AvatarFallback className="text-lg font-bold">
                    {imageLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : user.name?.split(" ").length > 1 ? (
                      `${user.name.split(" ")[0][0]}${user.name.split(" ").pop()?.[0]}`.toUpperCase()
                    ) : (
                      user.name?.[0]?.toUpperCase()
                    )}
                  </AvatarFallback>
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

            {error && <div className="text-sm text-destructive">{error}</div>}

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
                  disabled={!isEditing || loading}
                  className="pl-12"
                  required
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
                  disabled={true}
                  className="pl-12"
                  required
                />
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setError("");
                      setAvatarFile(null);
                      if (avatarPreview) {
                        URL.revokeObjectURL(avatarPreview);
                        setAvatarPreview("");
                      }
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Only show subscription section for users who have or had a subscription */}
      {(isSubscribed || isSubscriptionExpired) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Your current subscription status and details</CardDescription>
              </div>
              <Badge
                variant={!isSubscriptionExpired ? "success" : "destructive"}
                className="text-xs font-medium flex items-center gap-1"
              >
                {!isSubscriptionExpired ? (
                  <>
                    <Check className="h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3" />
                    Expired
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiryDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {isSubscriptionExpired ? "Expired" : "Expires"} {dayjs(expiryDate).fromNow()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expiry Date: {dayjs(expiryDate).format("MMM D, YYYY")}
                  </div>
                </div>
              )}
              {isSubscriptionExpired ? <Pay /> : null}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>Read our privacy policy to understand how we handle your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Button variant="link" className="px-0" asChild onClick={() => navigate("/privacy")}>
              <p className="text-sm">
                View Privacy Policy <ExternalLink className="ml-1 h-4 w-4" />
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Get help with your account or technical issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Need assistance? Our support team is here to help you with any questions or concerns.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                className="gap-2 w-full"
                onClick={() => window.open("https://wa.me/" + WHATSAPP_NUMBER, "_blank")}
              >
                <MessageCircleQuestion className="h-4 w-4" /> Contact on WhatsApp
              </Button>
              <Button variant="outline" className="gap-2 w-full" onClick={handleContactSupport}>
                <Mail className="h-4 w-4" /> Email Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-center text-muted-foreground">VERSION: {APP_VERSION}</p>
    </div>
  );
};

export default Profile;
