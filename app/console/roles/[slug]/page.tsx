"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import PageForm from "../components/page-form";
import { AppSidebar } from "@/components/app-sidebar";
import { getSidebar } from "../../page.config";
import { apiPath, breadcrumb, pageRoute, title } from "../page.config";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DetailFormPage() {
    const user = localStorage.getItem('user_data') || '{}';
    const tenant = localStorage.getItem('tenant_data') || '[]';
    const userData = JSON.parse(user)
    const tenantData = JSON.parse(tenant)
    const sidebar = getSidebar(apiPath, userData, tenantData)

    const params = useParams();
    const router = useRouter();
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

    const [dataInput, setDataInput] = useState();

    const fetchDataByID = async (id: any) => {
        try {
            const res = await fetch(`${apiPath}/api/${id}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            })

            if (res.status === 401) {
                toast.error("Session expired. Please log in again.");
                router.push("/login");
                return;
            }

            if (res.status === 403) {
                toast.error("You do not have permission to access this resource.");
                return;
            }

            if (!res.ok) throw new Error("Fetch failure")

            const { data } = await res.json()
            if (data) setDataInput(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        if (slug) {
            fetchDataByID(slug);
        }
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar sidebar={sidebar} />
            <PageForm
                isDetail
                id={slug}
                defaultValues={dataInput}
                breadcrumb={[
                    ...breadcrumb,
                    { name: `Detail ${title}`, href: pageRoute.details(slug ?? '') }
                ]}
            />
        </SidebarProvider>
    );
}
