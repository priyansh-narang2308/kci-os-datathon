import { useEffect } from "react"
import { Navigate, createHashRouter, RouterProvider, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/pages/LoginPage"
import DashboardLayout from "@/layouts/DashboardLayout"
import InvestigationPage from "@/pages/InvestigationPage"
import NetworkPage from "@/pages/NetworkPage"
import HotspotsPage from "@/pages/HotspotsPage"
import AlertsPage from "@/pages/AlertsPage"
import TrendsPage from "@/pages/TrendsPage"
import AuditPage from "@/pages/AuditPage"
import SettingsPage from "@/pages/SettingsPage"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-svh items-center justify-center bg-emerald-950">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm text-emerald-400/60">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function RoleRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useAuth()
  const userRole = user?.role || ""

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function LandingRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    const redirect = sessionStorage.getItem("redirect")
    if (redirect) {
      sessionStorage.removeItem("redirect")
      const path = redirect.replace("/app", "") || "/dashboard"
      navigate(path, { replace: true })
    }
  }, [navigate])
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <LandingPage />
}

function IndexHtmlRedirect() {
  const navigate = useNavigate()
  useEffect(() => { navigate("/", { replace: true }) }, [navigate])
  return null
}

const router = createHashRouter([
  {
    path: "/",
    children: [
      {
        path: "index.html",
        element: <IndexHtmlRedirect />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        index: true,
        element: <LandingRoute />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <RoleRoute allowedRoles={["investigator","supervisor","admin"]}><InvestigationPage /></RoleRoute> },
          { path: "network", element: <RoleRoute allowedRoles={["investigator","analyst","admin"]}><NetworkPage /></RoleRoute> },
          { path: "hotspots", element: <RoleRoute allowedRoles={["analyst","admin"]}><HotspotsPage /></RoleRoute> },
          { path: "alerts", element: <RoleRoute allowedRoles={["investigator","analyst","supervisor","admin"]}><AlertsPage /></RoleRoute> },
          { path: "trends", element: <RoleRoute allowedRoles={["analyst","supervisor","policymaker","admin"]}><TrendsPage /></RoleRoute> },
          { path: "audit", element: <RoleRoute allowedRoles={["analyst","supervisor","policymaker","admin"]}><AuditPage /></RoleRoute> },
          { path: "settings", element: <RoleRoute allowedRoles={["supervisor","policymaker","admin"]}><SettingsPage /></RoleRoute> },
        ],
      },
    ],
  },
],)


export default function App() {
  return <RouterProvider router={router} />
}
