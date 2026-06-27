import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const DEMO_CREDENTIALS = [
  { username: "investigator", password: "invest123", role: "Investigator", label: "Inspector Sharma" },
  { username: "analyst", password: "analyst123", role: "Analyst", label: "Analyst Rao" },
  { username: "supervisor", password: "super123", role: "Supervisor", label: "DG Iyer" },
  { username: "policymaker", password: "policy123", role: "Policymaker", label: "Secretary Nair" },
  { username: "admin", password: "admin123", role: "Admin", label: "System Administrator" },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password")
      return
    }
    setLoading(true)
    try {
      await login(username.trim(), password.trim())
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (u: string, p: string) => {
    setError("")
    setLoading(true)
    try {
      await login(u, p)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-emerald-950">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/25">
              <Shield className="size-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">KCI-OS</h1>
            <p className="mt-1 text-sm text-emerald-400/70">Karnataka Crime Intelligence OS</p>
          </div>

          <div className="rounded-xl border border-emerald-800 bg-emerald-900/50 p-6 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-emerald-200" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="mt-1.5 block w-full rounded-lg border border-emerald-700 bg-emerald-950/50 px-3 py-2 text-sm text-white placeholder-emerald-500/50 outline-none ring-0 transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-emerald-200" htmlFor="password">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full rounded-lg border border-emerald-700 bg-emerald-950/50 px-3 py-2 pr-10 text-sm text-white placeholder-emerald-500/50 outline-none ring-0 transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400/60 hover:text-emerald-300"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-emerald-800/50 bg-emerald-900/30 p-5">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-emerald-400/60">
              Demo Access — Quick Select
            </p>
            <div className="grid gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.username}
                  onClick={() => quickLogin(cred.username, cred.password)}
                  disabled={loading}
                  className="flex items-center gap-3 rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-2.5 text-left transition-colors hover:border-emerald-700 hover:bg-emerald-900/50 disabled:opacity-50"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xs font-medium text-emerald-300">
                    {cred.role[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-emerald-100">{cred.label}</div>
                    <div className="text-xs text-emerald-400/60">{cred.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-emerald-600/50">
            Karnataka State Police — Datathon 2026
          </p>
        </div>
      </div>
    </div>
  )
}
