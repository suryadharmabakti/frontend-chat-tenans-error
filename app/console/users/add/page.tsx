"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import PageForm from "../components/page-form";
import { AppSidebar } from "@/components/app-sidebar";
import { apiPath, breadcrumb, pageRoute, title } from "../page.config";
import { getSidebar } from "../../page.config";

export default function AddFormPage() {
    const user = localStorage.getItem('user_data') || '{}';
    const tenant = localStorage.getItem('tenant_data') || '[]';
    const userData = JSON.parse(user)
    const tenantData = JSON.parse(tenant)
    const sidebar = getSidebar(apiPath, userData, tenantData)

    return (
        <SidebarProvider>
            <AppSidebar sidebar={sidebar} />
            <PageForm
                breadcrumb={[
                    ...breadcrumb,
                    { name: `Add ${title}`, href: pageRoute.add }
                ]}
            />
        </SidebarProvider>
    );
}
