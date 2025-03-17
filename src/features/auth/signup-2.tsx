import { type FC } from "@/lib/vendors";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Input } from "@/components/common/ui/input";
import { useNavigate } from "react-router-dom";
import { store } from "@/services/store";
import { signup, handleLoginSuccess } from "@/services/backend/actions";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "@/assets/icons";
import { useState, useEffect } from "react";

const Signup: FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn = false } = store.auth.get() ?? {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    console.log("Auth state check:", { isLoggedIn });
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => setError("");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setError("");

      // Validate inputs
      if (!email || !password || !name) {
        setError("Please fill in all fields");
        return;
      }

      setLoading(true);

      const response = await signup({
        name: name,
        email: email,
        password: password,
      });

      console.log("Signup response:", response);

      if (response) {
        if (response.err) {
          // Handle error from signup
          setError("Failed to create account");
          return;
        }

        // Success case - user was created and logged in
        const userDetailsResult = await handleLoginSuccess(response);
        if (userDetailsResult.success) {
          navigate("/");
        } else {
          console.error("Failed to set auth state after signup");
          setError("Account created but login failed. Please try logging in manually.");
        }
      } else {
        setError("Failed to create account");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center py-4 px-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl md:text-2xl">Sign up</CardTitle>
            <CardDescription className="text-xs md:text-sm">Create an account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-l-md bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 placeholder:text-xs md:placeholder:text-sm"
                    disabled={loading}
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
                    placeholder="Email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 placeholder:text-xs md:placeholder:text-sm"
                    disabled={loading}
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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-10 placeholder:text-xs md:placeholder:text-sm"
                    disabled={loading}
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
              </div>

              {error && <div className="text-xs md:text-sm text-destructive">{error}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>

              <div className="text-center text-xs md:text-sm">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="px-0 text-xs md:text-sm"
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
