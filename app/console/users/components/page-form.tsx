"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PageBreadcrumb } from "@/components/dynamic-page";
import { apiPath, title } from "../page.config";
import AsyncSelect from "react-select/async";
import { SingleValue } from "react-select";
import Cookies from "js-cookie";

const getFormSchema = (isEdit: boolean) =>
    z
        .object({
            name: z.string().min(1, "Name is required"),
            email: z.string().email("Invalid email"),
            password: isEdit
                ? z.string().optional()
                : z.string().min(6, "Password must be at least 6 characters"),
            repassword: isEdit
                ? z.string().optional()
                : z.string().min(6, "Confirm Password must be at least 6 characters"),
            role: z.string().min(1, "Role is required").optional(),
        })
        .refine(
            (data) =>
                isEdit ? !data.password || data.password === data.repassword : data.password === data.repassword,
            {
                message: "Passwords do not match",
                path: ["repassword"],
            }
        );

export interface Props {
    id?: string;
    defaultValues?: any;
    redirect?: string;
    isDetail?: boolean;
    breadcrumb?: PageBreadcrumb[];
}

export default function PageForm({
    id,
    defaultValues,
    redirect,
    isDetail,
    breadcrumb,
}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const tenantID = Cookies.get("tenant");

    const schema = getFormSchema(!!id);
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues || {
            name: "",
            email: "",
            password: "",
            repassword: "",
            role: "",
        },
        mode: "onChange",
    });

    const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setLoading(true);
        try {
            const { repassword, role, ...cleanData } = data;

            const res = await fetch(`${apiPath}/api${id ? `/${id}` : ""}`, {
                method: id ? "PUT" : "POST",
                body: JSON.stringify({ ...cleanData, tenant_id: tenantID, role_id: role }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error(`Failed to save ${title.toLowerCase()}`);

            const { message } = await res.json();
            toast.success(message);
            router.replace(redirect ?? apiPath);
        } catch (err: any) {
            const method = id ? "Edit" : "Create";
            toast.error(`${method} unsuccessful!`, { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch(`/console/roles/api?tenants.id=${tenantID}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (res.status === 401) {
                toast.error("Session expired. Please log in again.");
                router.push("/login");
                return;
            }

            if (res.status === 403) {
                toast.error("You do not have permission to access this resource.");
                return;
            }

            if (!res.ok) throw new Error("Fetch role failure");

            const { data } = await res.json();
            const options = data.map((role: any) => ({
                label: role.name,
                value: role.id,
            }));
            setRoleOptions(options);
        } catch (err: any) {
            toast.error("Get role unsuccessful!", { description: err.message });
        }
    };

    const customStylesAsynSelect = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: "white",
            borderColor: state.isFocused ? "#d4d4d8" : "#e4e4e7", // Tailwind's slate-300 & gray-200
            boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.5)" : "none", // blue-500 ring
            borderRadius: "0.5rem", // rounded-md
            minHeight: "2.5rem", // h-10
            fontSize: "0.875rem", // text-sm
            lineHeight: "1.25rem", // leading-5
            paddingLeft: "0.2rem", // px-3
            paddingRight: "0.75rem",
            "&:hover": {
                borderColor: "#d4d4d8",
            },
        }),
        placeholder: (base: any) => ({
            ...base,
            color: "#9ca3af", // text-muted
            fontSize: "0.875rem",
        }),
        singleValue: (base: any) => ({
            ...base,
            fontSize: "0.875rem",
        }),
        menu: (base: any) => ({
            ...base,
            zIndex: 10,
        }),
    };

    useEffect(() => {
        fetchRoles();

        if (defaultValues) {
            form.reset({
                ...defaultValues,
                password: "",
                repassword: "",
                role: "",
            });
        }
    }, [defaultValues]);

    useEffect(() => {
        if (defaultValues?.role_id && roleOptions.length > 0) {
            form.setValue("role", defaultValues.role_id);
        }
    }, [roleOptions, defaultValues?.role_id]);

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-2">
                <div className="flex items-center gap-2 px-4 overflow-hidden">
                    <SidebarTrigger className="-ml-1" />
                    {breadcrumb && (
                        <>
                            <Separator orientation="vertical" className="mr-1 h-4" />
                            <Breadcrumb className="whitespace-nowrap overflow-hidden text-ellipsis">
                                <BreadcrumbList>
                                    {breadcrumb.map((item, index) => (
                                        <div key={index} className="flex items-center">
                                            <BreadcrumbItem className="hidden md:block">
                                                <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                                            </BreadcrumbItem>
                                            {(index + 1) !== breadcrumb.length && (
                                                <BreadcrumbSeparator className="hidden md:block ml-1" />
                                            )}
                                        </div>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </>
                    )}
                </div>
            </header>

            <main className="w-full px-6 py-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {id ? isDetail ? `Detail ${title}` : `Edit ${title}` : `Create ${title}`}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isDetail ? "" : `Complete the ${title.toLowerCase()} data below.`}
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama</FormLabel>
                                        <FormControl>
                                            <Input disabled={isDetail} placeholder="Enter nama" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" disabled={isDetail} placeholder="Enter email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <AsyncSelect
                                                styles={customStylesAsynSelect}
                                                isDisabled={isDetail}
                                                defaultOptions={roleOptions}
                                                value={roleOptions.find(option => option.value === field.value) || null}
                                                onChange={(option: SingleValue<{ label: string; value: string }>) =>
                                                    field.onChange(option?.value)
                                                }
                                                placeholder="Pilih Role"
                                                isClearable
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!isDetail && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Enter password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="repassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Repeat your password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <div className="flex justify-end gap-3 mt-10">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(redirect ?? apiPath)}
                                >
                                    Back
                                </Button>
                                <Button type="submit" disabled={loading} hidden={isDetail}>
                                    {loading ? (
                                        <>
                                            <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                                            Loading...
                                        </>
                                    ) : id ? (
                                        "Edit"
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </main>
        </SidebarInset>
    );
}
