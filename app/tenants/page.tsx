"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, LogOut, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import PageModalForm from "./components/page-modal-form";


interface Tenant {
    id: string;
    name: string;
}

export default function Page() {
    const [data, setData] = useState<Tenant[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const safeHues = [
        220, 240, 260, 280, 300, 320 // biru, ungu, pink
    ];

    function getRandomColor(uuid: string) {
        let hash = 0;
        for (let i = 0; i < uuid.length; i++) {
            hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
        }

        const hue = safeHues[Math.abs(hash) % safeHues.length];
        const saturation = 65 + (Math.abs(hash) % 15); // 65–80%
        const lightness = 75 + (Math.abs(hash) % 10);  // 75–85%

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

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

    const handleSelectTenant = async (tenant_uuid: any) => {
        setLoading(true);
        try {
            const res = await fetch(`/tenants/api/select-tenant`, {
                method: "POST",
                body: JSON.stringify({ tenant_id: tenant_uuid }),
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to select tenant");

            const { user } = await res.json()

            Cookies.set("tenant", tenant_uuid);
            localStorage.setItem("user_data", JSON.stringify(user))
            localStorage.setItem('tenant_data', JSON.stringify(data.find((v) => v.id === tenant_uuid)));
            router.push(`/`);
        } catch (err: any) {
            toast.error(`Select tenant unsuccessful!`, { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTenant = async (name: string) => {
        try {
            setLoading(true);
            const res = await fetch("/tenants/api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    user_id: user.id
                }),
            });

            if (!res.ok) throw new Error("Failed to create tenant");

            toast.success("Tenant created successfully!");
            fetchData(user.id);
        } catch (err: any) {
            toast.error("Create tenant failed", { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const fetchData = useCallback(async (user_id: string) => {
        setLoading(true)

        try {
            const res = await fetch(`/tenants/api?users.id=${user_id}`, {
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
            if (data) setData(data || []);
        } catch (err: any) {
            toast.error("Get unsuccessful!", { description: err.message })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const current = localStorage.getItem("user_data") || localStorage.getItem("user");
        if (current) setUser(JSON.parse(current));
    }, []);

    useEffect(() => {
        if (user) fetchData(user.id);
    }, [user])

    if (!user || loading) return <div className="p-6 text-muted">Loading...</div>;

    return (
        <div className="p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome back{user?.name ? `, ${user.name}` : ""} 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Select your tenant to continue managing your business.
                    </p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-1 h-4 w-4" /> Logout
                </Button>
            </div>

            {/* Tenant Cards */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Choose a workspace to get started:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {data.map((tenant) => {
                        const borderColor = getRandomColor(tenant.id);
                        return (
                            <Card
                                key={tenant.id}
                                className="hover:shadow-md transition-shadow cursor-pointer border-[3px] shadow-none"
                                style={{ borderColor }}
                                onClick={() => handleSelectTenant(tenant.id)}
                            >
                                <CardHeader className="flex flex-row items-center gap-2">
                                    <Building2 className="w-5 h-5 text-muted-foreground" />
                                    <CardTitle className="text-lg font-semibold">{tenant.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Access your workspace and manage your operations.
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}


                    {/* Add Tenant */}
                    <PageModalForm
                        onSubmit={handleCreateTenant}
                    />
                </div>
            </div>
        </div>
    );
}
