"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavProjects } from "./nav-projects"
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react"
import Cookies from "js-cookie"
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  sidebar: {
    tenant: any
    navMain: any
    projects: any
    user: any
  }
}

export function AppSidebar({ sidebar, ...props }: AppSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem("user_data");
    localStorage.removeItem("tenant_data");
    await fetch("/logout/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // include cookies
    });

    // Redirect
    router.push("/login");
  };

  const handleSelectTenant = async () => {
    Cookies.remove("tenant");
    localStorage.removeItem("tenant_data");

    // Redirect
    router.push("/tenant");
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{sidebar.tenant.name}</span>
            <span className="truncate text-xs">{sidebar.tenant.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={sidebar.projects} />
        <NavMain items={sidebar.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebar.user} handleLogout={handleLogout} handleSelectTenant={handleSelectTenant} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
