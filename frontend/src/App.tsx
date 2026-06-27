import { Navigate, createBrowserRouter, RouterProvider, useLocation } from "react-router-dom"
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

function LandingRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <LandingPage />
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <LandingRoute />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <InvestigationPage /> },
      { path: "network", element: <NetworkPage /> },
      { path: "hotspots", element: <HotspotsPage /> },
      { path: "alerts", element: <AlertsPage /> },
      { path: "trends", element: <TrendsPage /> },
      { path: "audit", element: <AuditPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
