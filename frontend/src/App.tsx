import { createBrowserRouter, RouterProvider } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import DashboardLayout from "@/layouts/DashboardLayout"
import InvestigationPage from "@/pages/InvestigationPage"
import NetworkPage from "@/pages/NetworkPage"
import HotspotsPage from "@/pages/HotspotsPage"
import AlertsPage from "@/pages/AlertsPage"
import TrendsPage from "@/pages/TrendsPage"
import AuditPage from "@/pages/AuditPage"
import SettingsPage from "@/pages/SettingsPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
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
