import { createBrowserRouter, RouterProvider } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import DashboardLayout from "@/layouts/DashboardLayout"
import InvestigationPage from "@/pages/InvestigationPage"

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
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
