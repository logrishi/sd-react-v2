import { useEffect, useState, type FC } from "@/lib/vendors";
import { useNavigate } from "react-router-dom";
import { store } from "@/services/store";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Label } from "@/components/common/ui/label";
import { Alert, AlertDescription } from "@/components/common/ui/alert";
import { resetPassword, checkUserExists } from "@/services/backend/actions";
import { generateOtpWithTimestamp, sendMail, verifyOtp, hashPassword } from "@/lib/utils/utils";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

const ForgotPassword: FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = store.auth.get() ?? {};
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState<{ id: number } | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  }, [success, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // First check if user exists
      const existingUser = await checkUserExists(email, { fields: "id" });
      if (!existingUser?.result?.length) {
        setError("No account found with this email");
        return;
      }

      setUser(existingUser.result[0]);

      // Generate and send OTP only if user exists
      const { otp, timestamp } = generateOtpWithTimestamp();
      const response = await sendMail({ email, otp, timestamp });

      if (response.err) {
        setError("Failed to send OTP");
      } else {
        setOtpSent(true);
      }
    } catch (err: any) {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    console.log("handleVerifyOtp");
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await verifyOtp({ otp });
      if (!response.success) {
        setError(response.message);
      } else {
        setOtpVerified(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!user) {
      setError("User not found");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const hashedPassword = await hashPassword(password);
      const response = await resetPassword(user.id, hashedPassword, { 
        force_password_reset: 0, 
        update_password: 0 
      });

      if (response.err) {
        setError("Failed to reset password");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center pt-0 px-6 pb-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              {!otpSent
                ? "Enter your email to reset your password"
                : !otpVerified
                  ? "Enter the OTP sent to your email"
                  : "Enter your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="text-sm text-destructive mb-4">{error}</div>}
            {success && (
              <Alert className="mb-4">
                <AlertDescription>Password reset successful. Redirecting to login...</AlertDescription>
              </Alert>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-l-md bg-muted">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12"
                    disabled={loading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>

                <div className="text-center text-sm">
                  Remember your password?{" "}
                  <Button variant="link" className="px-0" type="button" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                </div>
              </form>
            ) : !otpVerified ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <Input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="text-center text-lg h-12"
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const newOtp = otp.split("");
                        newOtp[i] = e.target.value;
                        setOtp(newOtp.join(""));
                        if (e.target.value && i < 3) {
                          const nextInput = document.querySelector(`input[name=otp-${i + 1}]`) as HTMLInputElement;
                          if (nextInput) nextInput.focus();
                        }
                      }}
                      name={`otp-${i}`}
                      disabled={loading}
                      required
                    />
                  ))}
                </div>

                <Button type="submit" className="w-full" disabled={loading || otp.length !== 4}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                <div className="text-center">
                  <Button variant="link" className="text-sm" type="button" onClick={() => setOtpSent(false)}>
                    Send OTP again?
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-l-md bg-muted">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-10"
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-l-md bg-muted">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-10"
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>

                <div className="text-center">
                  <Button variant="link" className="text-sm" type="button" onClick={() => setOtpVerified(false)}>
                    Enter OTP again?
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
