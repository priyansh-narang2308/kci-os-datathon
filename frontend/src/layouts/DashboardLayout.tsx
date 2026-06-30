"use client"

import { NavLink, useLocation, Outlet, useNavigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
  SidebarInset,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LanguageSelector } from "@/components/LanguageSelector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MessageSquareText,
  Network,
  Map,
  Bell,
  TrendingUp,
  ScrollText,
  Settings,
  ChevronDown,
  Search,
  Zap,
  Shield,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const NAV_ITEMS = [
  {
    group: "Primary",
    roles: ["admin", "investigator", "supervisor"],
    items: [
      { label: "Investigation", href: "/dashboard", icon: MessageSquareText },
    ],
  },
  {
    group: "Intelligence",
    roles: ["admin", "investigator", "analyst", "supervisor"],
    items: [
      { label: "Network Analysis", href: "/dashboard/network", icon: Network },
      { label: "Hotspots", href: "/dashboard/hotspots", icon: Map },
      { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
    ],
  },
  {
    group: "Data",
    roles: ["admin", "investigator", "analyst", "supervisor", "policymaker"],
    items: [
      { label: "Trends", href: "/dashboard/trends", icon: TrendingUp },
      { label: "Audit Log", href: "/dashboard/audit", icon: ScrollText },
    ],
  },
  {
    group: "System",
    roles: ["admin", "supervisor", "policymaker"],
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

const ROLE_OPTIONS = [
  { role: "investigator", label: "Investigator" },
  { role: "analyst", label: "Analyst" },
  { role: "supervisor", label: "Supervisor" },
  { role: "policymaker", label: "Policymaker" },
]

function RoleSwitcher({ user, onSwitch, onLogout }: { user: NonNullable<ReturnType<typeof useAuth>["user"]>; onSwitch: (role: string) => void; onLogout: () => void }) {
  const initials = user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg">
          <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-emerald-800 text-emerald-300 text-xs font-medium">
            {initials}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">
              {user.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.badge}
            </span>
          </div>
          <ChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width)"
        align="start"
        side="top"
        sideOffset={8}
      >
        <div className="border-b border-border px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground">Switch Role</p>
        </div>
        {ROLE_OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt.role} onClick={() => onSwitch(opt.role)} disabled={opt.role === user.role}>
            <span>{opt.label}</span>
            {opt.role === user.role && <span className="ml-auto text-xs text-emerald-500">Active</span>}
          </DropdownMenuItem>
        ))}
        <div className="border-t border-border mt-1 pt-1">
          <DropdownMenuItem onClick={onLogout} className="text-red-400">
            <LogOut className="mr-2 size-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, switchRole, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const handleSwitchRole = async (role: string) => {
    await switchRole(role)
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <TooltipProvider delayDuration={0}>
      <div className="flex h-svh max-h-svh w-full overflow-hidden">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <NavLink to="/dashboard">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <Shield className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">KCI-OS</span>
                      <span className="truncate text-xs text-muted-foreground">
                        Crime Intelligence OS
                      </span>
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            {NAV_ITEMS.filter(g => user && g.roles.includes(user.role)).map((group) => (
              <SidebarGroup key={group.group}>
                <SidebarGroupContent>
                  <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">{group.group}</SidebarGroupLabel>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                          >
                            <NavLink to={item.href}>
                              <item.icon className={isActive ? "text-emerald-400" : ""} />
                              <span>{item.label}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarSeparator />

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                {user && (
                  <RoleSwitcher user={user} onSwitch={handleSwitchRole} onLogout={handleLogout} />
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background min-w-0 flex-1 flex flex-col h-full max-h-full overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 sticky top-0 z-30">
            <SidebarTrigger className="cursor-pointer" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="size-4" />
              <span className="hidden sm:inline text-muted-foreground/60">Ask anything about crime data...</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSelector variant="dark" />
              <div className="hidden items-center gap-1.5 text-xs text-muted-foreground/50 sm:flex">
                <Zap className="size-3" />
                <span>Live</span>
              </div>
            </div>
          </header>

          <Outlet />
        </SidebarInset>
      </div>
      </TooltipProvider>
    </SidebarProvider>
  )
}
