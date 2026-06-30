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
  Shield,
  LogOut,
  Command,
  Search,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const NAV_ITEMS = [
  {
    group: "Investigation",
    roles: ["investigator", "supervisor", "admin"],
    items: [
      { label: "Investigation", href: "/dashboard", icon: MessageSquareText },
    ],
  },
  {
    group: "Network",
    roles: ["investigator", "analyst", "admin"],
    items: [
      { label: "Network Analysis", href: "/dashboard/network", icon: Network },
    ],
  },
  {
    group: "Analysis",
    roles: ["analyst", "admin"],
    items: [
      { label: "Hotspots", href: "/dashboard/hotspots", icon: Map },
    ],
  },
  {
    group: "Monitoring",
    roles: ["investigator", "analyst", "supervisor", "admin"],
    items: [
      { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
    ],
  },
  {
    group: "Intelligence",
    roles: ["analyst", "supervisor", "policymaker", "admin"],
    items: [
      { label: "Trends", href: "/dashboard/trends", icon: TrendingUp },
      { label: "Audit Log", href: "/dashboard/audit", icon: ScrollText },
    ],
  },
  {
    group: "Administration",
    roles: ["supervisor", "policymaker", "admin"],
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
            
            {/* Sleek Interactive Search Bar */}
            <div className="relative flex-1 max-w-lg mx-1">
              <div className="flex items-center gap-2.5 rounded-full bg-stone-100/90 border border-stone-200/80 px-3.5 py-1.5 text-sm transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 shadow-2xs hover:bg-stone-100">
                <Search className="size-4 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Search FIR records, suspect IDs, entities or Cypher patterns..."
                  className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 font-medium"
                />
                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-stone-300/80 bg-white px-1.5 font-mono text-[10px] font-semibold text-stone-500 shadow-2xs">
                  <Command className="size-2.5" /> K
                </kbd>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2.5 shrink-0">
              <LanguageSelector variant="dark" />
              <div className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-500/20 sm:flex">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
