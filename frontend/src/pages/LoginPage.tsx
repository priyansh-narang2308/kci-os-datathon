import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  User,
  Key,
  Users,
  BadgeCheck,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEMO_CREDENTIALS = [
  {
    username: "investigator",
    password: "invest123",
    role: "Investigator",
    label: "Inspector Sharma",
    badge: "Field Operations",
  },
  {
    username: "analyst",
    password: "analyst123",
    role: "Analyst",
    label: "Analyst Rao",
    badge: "Intelligence",
  },
  {
    username: "supervisor",
    password: "super123",
    role: "Supervisor",
    label: "DG Iyer",
    badge: "Command",
  },
  {
    username: "policymaker",
    password: "policy123",
    role: "Policymaker",
    label: "Secretary Nair",
    badge: "Strategy",
  },
  {
    username: "admin",
    password: "admin123",
    role: "Admin",
    label: "System Administrator",
    badge: "System",
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
    <div className="flex min-h-svh flex-col lg:flex-row bg-background">
      {/* Back button - always visible */}
      <div className="absolute left-6 top-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>

      {/* Left side - Login Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 lg:px-8">
        <div className="w-full max-w-[420px] space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.1 }}
            className="text-center"
          >
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
              <Shield className="size-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              KCI-OS
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Karnataka Crime Intelligence OS
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              type: "spring",
              duration: 0.7,
              bounce: 0.1,
              delay: 0.1,
            }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg">Sign in</CardTitle>
                <CardDescription>
                  Enter your credentials to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="pl-9 h-11"
                        autoComplete="username"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-9 pr-10 h-11"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive border border-destructive/20"
                    >
                      {error}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 cursor-pointer font-medium"
                  >
                    {loading && (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    )}
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
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

      {/* Right side - Demo Credentials */}
      <div className="hidden lg:flex lg:w-[380px] lg:min-h-svh lg:flex-col lg:justify-center lg:px-6 lg:py-12 lg:border-l lg:border-border/50 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            duration: 0.7,
            bounce: 0.1,
            delay: 0.2,
          }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-5 text-emerald-600" />
            <h2 className="text-sm font-semibold text-foreground">
              Quick Demo Access
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Select a role to instantly explore the platform
          </p>

          <div className="space-y-2">
            {DEMO_CREDENTIALS.map((cred, index) => (
              <motion.button
                key={cred.username}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => quickLogin(cred.username, cred.password)}
                disabled={loading}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50",
                  "hover:bg-background hover:border-emerald-500/50 hover:shadow-md",
                  "transition-all duration-200 cursor-pointer group",
                  "text-left",
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 group-hover:bg-emerald-200 transition-colors">
                  {cred.role[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {cred.label}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/50">
                      {cred.badge || cred.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>@{cred.username}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span>{cred.role}</span>
                  </div>
                </div>
                <BadgeCheck className="size-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200/50">
            <p className="text-[11px] text-amber-700">
              ⚡ No registration required — explore the platform instantly
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mobile demo credentials (visible on small screens) */}
      <div className="lg:hidden px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="size-4 text-emerald-600" />
                Quick Demo Access
              </CardTitle>
              <CardDescription className="text-xs">
                Select a role to explore the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.username}
                  onClick={() => quickLogin(cred.username, cred.password)}
                  disabled={loading}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-lg border border-border/50",
                    "hover:bg-muted/50 hover:border-emerald-500/30",
                    "transition-colors cursor-pointer text-left",
                  )}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                    {cred.role[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {cred.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {cred.role}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
