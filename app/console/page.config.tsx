"use client";

import { Command, GalleryVerticalEnd, Layers, LayoutGrid } from "lucide-react"

interface UserData {
    id: string
    name: string
    email: string
}

interface TenantData {
    id: string
    name: string,
}

export function getSidebar(pathname: string, user?: UserData, tenant?: TenantData) {

    return {
        user: {
            name: user?.name ?? "Guest",
            email: user?.email ?? "-",
            avatar: "/avatars/shadcn.jpg",
        },
        tenant: tenant,
        projects: [
            {
                title: "Dashboard",
                url: "/",
                icon: LayoutGrid,
                isActive: pathname === "/"
            },
        ],
        navMain: [
            {
                title: "Master Data",
                url: "#",
                icon: Layers,
                isActive: ["/console/users", "/console/roles"].some((path) => pathname.startsWith(path)),
                items: [
                    {
                        title: "User Management",
                        url: "/console/users",
                        isActive: pathname === "/console/users",
                    },
                    {
                        title: "Role Management",
                        url: "/console/roles",
                        isActive: pathname === "/console/roles",
                    },
                ],
            },
        ],
    }
}
