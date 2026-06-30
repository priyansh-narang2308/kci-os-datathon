import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Shield, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEMO_CREDENTIALS = [
  {
    username: "investigator",
    password: "invest123",
    role: "Investigator",
    label: "Inspector Sharma",
  },
  {
    username: "analyst",
    password: "analyst123",
    role: "Analyst",
    label: "Analyst Rao",
  },
  {
    username: "supervisor",
    password: "super123",
    role: "Supervisor",
    label: "DG Iyer",
  },
  {
    username: "policymaker",
    password: "policy123",
    role: "Policymaker",
    label: "Secretary Nair",
  },
  {
    username: "admin",
    password: "admin123",
    role: "Admin",
    label: "System Administrator",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (u: string, p: string) => {
    setError("");
    setLoading(true);
    try {
      await login(u, p);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="absolute left-6 top-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px] space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.1 }}
            className="text-center"
          >
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-emerald-600 shadow-sm">
              <Shield className="size-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              KCI-OS
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Karnataka Crime Intelligence OS
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.1, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle>Sign in</CardTitle>
                <CardDescription>
                  Enter your credentials to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pr-10"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.1, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-medium">Demo Access</CardTitle>
                <CardDescription>
                  Quick-select a role to explore the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-1.5">
                {DEMO_CREDENTIALS.map((cred) => (
                  <button
                    key={cred.username}
                    onClick={() => quickLogin(cred.username, cred.password)}
                    disabled={loading}
                    className={cn(
                      buttonVariants({
                        variant: "outline",
                        className: "w-full justify-start gap-3 h-auto py-2.5",
                      }),
                    )}
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                      {cred.role[0]}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{cred.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {cred.role}
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-center text-xs text-muted-foreground"
          >
            Karnataka State Police - Datathon 2026
          </motion.p>
        </div>
      </div>
    </div>
  );
}
