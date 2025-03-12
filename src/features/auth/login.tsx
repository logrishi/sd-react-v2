import { type FC } from "@/lib/vendors";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Input } from "@/components/common/ui/input";
import { useNavigate } from "react-router-dom";
import { store } from "@/services/store";
import { checkUserExists, login, resetPassword, handleLoginSuccess } from "@/services/backend/actions";
import { Eye, EyeOff, Mail, Lock } from "@/assets/icons";
import { useState, useEffect } from "react";
import { withForceFlags } from "@/components/auth/with-force-flags";
import { comparePassword, hashPassword } from "@/lib/utils/utils";

const Login: FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn = false } = store.auth.get() ?? {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // Input validation
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      setLoading(true);

      // Step 1: Check if user exists
      const existingUser = await checkUserExists(email, {
        fields: "email, password, update_password, force_password_reset",
      });

      if (!existingUser?.result?.length) {
        setError("Invalid credentials");
        return;
      }
      const user = existingUser.result[0];

      // Step 2: Handle force password reset
      if (user.force_password_reset) {
        navigate("/password-reset");
        return;
      }

      // Step 3: Compare passwords
      const passwordMatch = await comparePassword(password, user.password);
      if (!passwordMatch) {
        setError("Invalid credentials");
        return;
      }

      // Step 4: Handle password update if required
      let loginHash = user.password; // Default to existing hash
      if (user.update_password) {
        // Generate new hash for the entered password
        const newHash = await hashPassword(password);
        const resetResponse = await resetPassword(user.id, newHash, { update_password: 0 });

        if (resetResponse.err) {
          setError("Failed to update password");
          return;
        }

        // Use new hash for login
        loginHash = newHash;
      }

      // Step 5: Login with appropriate hash
      const loginResponse = await login({
        email,
        password: loginHash,
      });

      const { success, error } = handleLoginSuccess(loginResponse);
      if (!success) {
        setError("Login failed");
        return;
      }
      navigate("/");
    } catch (err: any) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center pt-0 px-6 pb-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your email and password to login</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-sm text-destructive">{error}</div>}

              <div className="relative">
                <div className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-l-md bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  disabled={loading}
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-l-md bg-muted">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center">
                <Button variant="link" className="text-sm" type="button" onClick={() => navigate("/password-reset")}>
                  Forgot password?
                </Button>
              </div>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Button variant="link" className="px-0" type="button" onClick={() => navigate("/signup")}>
                  Sign up
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default withForceFlags(Login);
