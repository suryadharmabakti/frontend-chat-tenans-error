"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DynamicPage } from "@/components/dynamic-page"
import { getSidebar } from "../page.config"
import {
    apiPath, pageRoute, columnFormats as baseColumns, breadcrumb, title, filterFields
} from "./page.config"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { DefaultColumnFormat } from "@/components/dynamic-table"
import { hasPermission } from "@/lib/permission/check"
import userDefinition from "./access-definition"

export default function UserPage() {
    const pathname = usePathname()
    const router = useRouter()

    const [sidebar, setSidebar] = useState<any>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [user, setUser] = useState({})

    const handleDelete = async () => {
        if (!selectedId) return
        try {
            const res = await fetch(`${apiPath}/api/${selectedId}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (!res.ok) throw new Error("Failed to delete")

            const { message } = await res.json()
            toast.success(message)
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        } catch (err: any) {
            toast.error("Delete unsuccessful!", { description: err.message })
        } finally {
            setShowConfirm(false)
            setSelectedId(null)
        }
    }

    const viewAction = (id: string) => (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {hasPermission(user, `${userDefinition.id}:read`) && (
                        <DropdownMenuItem onClick={() => router.push(pageRoute.details(id))}>
                            View Data
                        </DropdownMenuItem>
                    )}
                    {hasPermission(user, `${userDefinition.id}:update`) && (
                        <DropdownMenuItem onClick={() => router.push(pageRoute.edit(id))}>
                            Edit Data
                        </DropdownMenuItem>
                    )}
                    {hasPermission(user, `${userDefinition.id}:delete`) && (
                        <DropdownMenuItem onClick={() => {
                            setSelectedId(id)
                            setShowConfirm(true)
                        }}>Delete Data</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="mt-4">
                            This action cannot be undone. This will permanently delete the {title.toLowerCase()}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )

    const columnFormats: DefaultColumnFormat[] = [
        ...baseColumns,
        {
            key: "actions",
            title: "Actions",
            type: "html",
            sortable: false,
            textClassName: "text-center",
            formatter: (_value: any, original: any) => viewAction(original.id),
        },
    ]

    useEffect(() => {
        const userRaw = localStorage.getItem("user_data") || "{}"
        const tenantRaw = localStorage.getItem("tenant_data") || "[]"
        const userData = JSON.parse(userRaw)
        const tenantData = JSON.parse(tenantRaw)

        const sidebarData = getSidebar(pathname, userData, tenantData)
        setUser(userData)
        setSidebar(sidebarData)
    }, [pathname])

    // ⛔ Hindari render sebelum sidebar siap
    if (!sidebar) return null

    return (
        <SidebarProvider>
            <AppSidebar sidebar={sidebar} />
            <DynamicPage
                title={title}
                breadcrumb={breadcrumb}
                filterFields={filterFields}
                columnFormats={columnFormats}
                apiPath={`${apiPath}/api`}
                pageRoute={pageRoute}
                showAddAction={hasPermission(user, `${userDefinition.id}:create`)}
                showExportAction={false}
                showImportAction={false}
                queryWithTenandID={true}
                slugTenantID="tenants.id"
            />
        </SidebarProvider>
    )
}
