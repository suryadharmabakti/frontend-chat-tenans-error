"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { DynamicPage } from "@/components/dynamic-page"
import {
    SidebarProvider
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { getSidebar } from "./page.config"
import { useEffect, useState } from "react"

export default function Console() {
    const pathname = usePathname()
    const [sidebar, setSidebar] = useState<any>(null)

    useEffect(() => {
        const userRaw = localStorage.getItem("user_data") || "{}"
        const tenantRaw = localStorage.getItem("tenant_data") || "[]"
        const userData = JSON.parse(userRaw)
        const tenantData = JSON.parse(tenantRaw)

        const sidebarData = getSidebar(pathname, userData, tenantData)
        setSidebar(sidebarData)
    }, [pathname])

    // ⛔ Hindari render sebelum sidebar siap
    if (!sidebar) return null

    return (
        <SidebarProvider>
            <AppSidebar sidebar={sidebar} />
            <div className="p-5">
                <h1>Dashboard</h1>
            </div>
        </SidebarProvider>
    )
}
