"use client"

import { NavLink, useLocation, Outlet } from "react-router-dom"
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
  SidebarInset,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
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
} from "lucide-react"

const navItems = [
  {
    group: "Primary",
    items: [
      { label: "Investigation", href: "/dashboard", icon: MessageSquareText },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "Network Analysis", href: "/dashboard/network", icon: Network },
      { label: "Hotspots", href: "/dashboard/hotspots", icon: Map },
      { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
    ],
  },
  {
    group: "Data",
    items: [
      { label: "Trends", href: "/dashboard/trends", icon: TrendingUp },
      { label: "Audit Log", href: "/dashboard/audit", icon: ScrollText },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

export default function DashboardLayout() {
  const location = useLocation()

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
            {navItems.map((group) => (
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-emerald-800 text-emerald-300 text-xs font-medium">
                        IN
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">
                          Investigator
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          Inspector Rank
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
                    <DropdownMenuItem>
                      <span>Analyst</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Supervisor</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Policymaker</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
