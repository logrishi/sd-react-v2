import { useEffect, useState, useCallback, type FC } from "@/lib/vendors";
import { useNavigate } from "react-router-dom";
import { store } from "@/services/store";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Alert, AlertDescription } from "@/components/common/ui/alert";
import { resetPassword, checkUserExists, login, handleLoginSuccess } from "@/services/backend/actions";
import { generateOtpWithTimestamp, sendMail, verifyOtp, hashPassword } from "@/lib/utils/utils";
import { Eye, EyeOff, Lock, Mail } from "@/assets/icons";

const PasswordReset: FC = () => {
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
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = useCallback(() => {
    setResendTimer(30); // 30 seconds cooldown
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Store hashed password for auto-login
  const [hashedPassword, setHashedPassword] = useState("");

  useEffect(() => {
    if (success && hashedPassword) {
      // Auto login after password reset using the stored hashed password
      const autoLogin = async () => {
        try {
          const loginResponse = await login({
            email: user?.email ?? "",
            password: hashedPassword, // Use the stored hashed password
          });

          const { success: loginSuccess } = handleLoginSuccess(loginResponse);
          if (loginSuccess) {
            navigate("/");
          } else {
            setError("Auto-login failed after password reset");
            navigate("/login");
          }
        } catch (err) {
          setError("Auto-login failed after password reset");
          navigate("/login");
        }
      };
      autoLogin();
    }
  }, [success, navigate, user?.email, hashedPassword]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Don't show loading state for resend
    if (!otpSent) {
      setLoading(true);
    }

    try {
      const existingUser = await checkUserExists(email, { fields: "id,email" });
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
        setOtp(""); // Clear OTP field when resending
        startResendTimer();
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
        update_password: 0,
      });

      if (response.err) {
        setError("Failed to reset password");
      } else {
        // Store hashed password for auto-login
        setHashedPassword(hashedPassword);
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
            <CardTitle className="text-xl md:text-2xl">Reset Password</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {!otpSent
                ? "Enter your email to reset your password"
                : !otpVerified
                  ? "Enter the OTP sent to your email"
                  : "Enter your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="text-xs md:text-sm text-destructive mb-4">{error}</div>}
            {success && (
              <Alert className="mb-4">
                <AlertDescription className="text-xs md:text-sm">Password reset successful. Logging you in...</AlertDescription>
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
                    className="pl-12 placeholder:text-xs md:placeholder:text-sm"
                    disabled={loading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
                {resendTimer > 0 && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    You can request another OTP in {resendTimer} seconds
                  </p>
                )}
                {!isLoggedIn && (
                  <div className="text-center text-sm">
                    Remember your password?{" "}
                    <Button variant="link" className="px-0" type="button" onClick={() => navigate("/login")}>
                      Login
                    </Button>
                  </div>
                )}
              </form>
            ) : !otpVerified ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <Input
                      key={i}
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={1}
                      className="text-center text-lg h-12"
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length > 1) {
                          // Handle paste of full OTP
                          const pastedOtp = value.slice(0, 4);
                          setOtp(pastedOtp);
                          const lastInput = document.querySelector(`input[name=otp-3]`) as HTMLInputElement;
                          if (lastInput) lastInput.focus();
                        } else {
                          const newOtp = otp.split("");
                          newOtp[i] = value;
                          setOtp(newOtp.join(""));
                          if (value && i < 3) {
                            const nextInput = document.querySelector(`input[name=otp-${i + 1}]`) as HTMLInputElement;
                            if (nextInput) nextInput.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[i] && i > 0) {
                          const prevInput = document.querySelector(`input[name=otp-${i - 1}]`) as HTMLInputElement;
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedData = e.clipboardData
                          .getData("text")
                          .replace(/[^0-9]/g, "")
                          .slice(0, 4);
                        setOtp(pastedData);
                        const lastInput = document.querySelector(`input[name=otp-3]`) as HTMLInputElement;
                        if (lastInput) lastInput.focus();
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
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                  <span>Didn't receive the code?</span>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm h-auto p-0"
                    disabled={resendTimer > 0}
                    onClick={handleSendOtp}
                  >
                    Send OTP again{resendTimer > 0 ? ` (${resendTimer}s)` : "?"}
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
                    className="pl-12 pr-10 placeholder:text-xs md:placeholder:text-sm"
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
                    className="pl-12 pr-10 placeholder:text-xs md:placeholder:text-sm"
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
                  {loading ? "Resetting password and logging in..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset;
