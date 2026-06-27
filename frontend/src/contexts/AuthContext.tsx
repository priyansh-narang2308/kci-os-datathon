import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export interface AuthUser {
  username: string
  role: string
  name: string
  badge: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  switchRole: (role: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const API_BASE = "/api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem("kci_os_token")
    if (savedToken) {
      try {
        const payload = JSON.parse(atob(savedToken.split(".")[1]))
        setUser({ username: payload.username, role: payload.role, name: payload.name, badge: payload.badge })
        setToken(savedToken)
      } catch {
        localStorage.removeItem("kci_os_token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Login failed")
    }
    const data = await res.json()
    localStorage.setItem("kci_os_token", data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const switchRole = useCallback(async (role: string) => {
    if (!token) return
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    })
    if (!res.ok) return
    const data = await res.json()
    localStorage.setItem("kci_os_token", data.token)
    setToken(data.token)
    setUser(data.user)
  }, [token])

  const logout = useCallback(() => {
    localStorage.removeItem("kci_os_token")
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, switchRole, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function authHeaders(token: string | null): Record<string, string> {
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
