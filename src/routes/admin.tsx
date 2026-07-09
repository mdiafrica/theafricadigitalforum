import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
} from "@tanstack/react-router"
import {
  Building2,
  CalendarDays,
  ChevronsUpDown,
  ExternalLink,
  FileText,
  Globe,
  Image,
  Inbox,
  Layout,
  LayoutDashboard,
  LogOut,
  Mic,
  UserCircle,
  Users,
} from "lucide-react"

import { requireStaff, useSessionQuery } from "@/domains/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth/auth-client"

/**
 * Admin shell — staff only (super_admin or org member). The guard is UX;
 * every server fn behind these pages re-checks permissions.
 */
export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context, location }) => {
    const session = await requireStaff({ context, location })
    return { session }
  },
  head: () => ({ meta: [{ title: "Admin | Africa Digital Forum" }] }),
  component: AdminLayout,
})

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  exact?: boolean
}

const NAV_GROUPS: Array<{ label?: string; items: NavItem[] }> = [
  {
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/admin/submissions", label: "Submissions", icon: Inbox },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/posts", label: "Posts", icon: FileText },
      { to: "/admin/speakers", label: "Speakers", icon: Mic },
      { to: "/admin/events", label: "Events", icon: CalendarDays },
      { to: "/admin/sponsors", label: "Sponsors", icon: Building2 },
      { to: "/admin/pages", label: "Pages", icon: Layout },
      { to: "/admin/media", label: "Media", icon: Image },
    ],
  },
  {
    label: "Organization",
    items: [
      { to: "/admin/team", label: "Team", icon: Users },
      { to: "/admin/account", label: "Account", icon: UserCircle },
    ],
  },
]

function isItemActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to)
}

function AdminLayout() {
  const { pathname } = useLocation()
  const current = NAV_GROUPS.flatMap((group) => group.items).find((item) =>
    isItemActive(item, pathname)
  )

  return (
    <TooltipProvider delay={300}>
      <SidebarProvider>
        <AdminSidebar pathname={pathname} />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 !h-4" />
            <span className="text-sm font-medium">
              {current?.label ?? "Admin"}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <Link
                to="/"
                target="_blank"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Globe className="size-4" />
                View site
                <ExternalLink className="size-3" />
              </Link>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function AdminSidebar({ pathname }: { pathname: string }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/admin" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary font-heading text-sm font-extrabold text-primary-foreground">
                A
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-heading font-bold">
                  ADF Admin
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Africa Digital Forum
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group, index) => (
          <SidebarGroup key={group.label ?? index}>
            {group.label && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={isItemActive(item, pathname)}
                      tooltip={item.label}
                      render={<Link to={item.to} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function UserMenu() {
  const sessionQuery = useSessionQuery()
  const user = sessionQuery.data?.user
  const initials =
    user?.name
      ?.split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"

  const signOut = () => {
    void authClient.signOut().then(() => {
      // Full navigation: clears cookie-cached session for every guard.
      window.location.assign("/sign-in")
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-(--anchor-width) min-w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="grid text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<Link to="/admin/account" />}
              closeOnClick
            >
              <UserCircle />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
