"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import PageForm from "../../components/page-form";
import { AppSidebar } from "@/components/app-sidebar";
import { getSidebar } from "../../../page.config";
import { apiPath, breadcrumb, pageRoute, title } from "../../page.config";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EditFormPage() {
    const [sidebar, setSidebar] = useState<any>(null)
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
        const userRaw = localStorage.getItem("user_data") || "{}"
        const tenantRaw = localStorage.getItem("tenant_data") || "[]"
        const userData = JSON.parse(userRaw)
        const tenantData = JSON.parse(tenantRaw)
        const sidebarData = getSidebar(apiPath, userData, tenantData)

        setSidebar(sidebarData)

        if (slug) {
            fetchDataByID(slug);
        }
    }, []);

    // ⛔ Hindari render sebelum sidebar siap
    if (!sidebar) return null

    return (
        <SidebarProvider>
            <AppSidebar sidebar={sidebar} />
            <PageForm
                id={slug}
                defaultValues={dataInput}
                breadcrumb={[
                    ...breadcrumb,
                    { name: `Edit ${title}`, href: pageRoute.edit(slug ?? '') }
                ]}
            />
        </SidebarProvider>
    );
}
