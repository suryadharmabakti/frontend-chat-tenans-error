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
import { Checkbox } from "@/components/ui/checkbox";
import { apiPath, title } from "../page.config";
import { loadAccessPermissions } from "@/lib/permission/access-permissions-loader";
import Cookies from 'js-cookie';

export const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().optional(),
    permissions: z.array(z.string()).nonempty({ message: "At least one permission is required" }),
});

export type FormSchema = z.infer<typeof formSchema>;

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

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues || {
            name: "",
            description: "",
            permissions: [],
        },
        mode: "onChange",
    });

    const onSubmit = async (data: FormSchema) => {
        setLoading(true);
        try {
            const tenantId = Cookies.get('tenant')
            const res = await fetch(`${apiPath}/api${id ? `/${id}` : ""}`, {
                method: id ? "PUT" : "POST",
                body: JSON.stringify({ ...data, tenant_id: tenantId }),
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

            if (!res.ok) throw new Error("Failed to save user");

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

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                name: defaultValues.name,
                description: defaultValues.description ?? "",
                permissions: defaultValues.permissions ?? [],
            });
        }
    }, [defaultValues, form]);

    // Load access-permissions.json
    const accessData = loadAccessPermissions();

    const groupedPermissions = accessData
        ? Object.values(
            Object.values(accessData.items as Record<string, any>).reduce(
                (acc, item) => {
                    const groupKey = item.group as string;

                    const groupMeta = (accessData.groups as Record<string, { name: string; description: string }>)[groupKey];

                    if (!acc[groupKey]) {
                        acc[groupKey] = {
                            group: groupMeta,
                            items: []
                        };
                    }

                    acc[groupKey].items.push(item);
                    return acc;
                },
                {} as Record<
                    string,
                    {
                        group: { name: string; description: string };
                        items: any[];
                    }
                >
            )
        )
        : [];

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4 overflow-hidden">
                    <SidebarTrigger className="-ml-1" />
                    {breadcrumb && (
                        <>
                            <Separator
                                orientation="vertical"
                                className="mr-1 data-[orientation=vertical]:h-4"
                            />
                            <Breadcrumb className="whitespace-nowrap overflow-hidden text-ellipsis">
                                <BreadcrumbList>
                                    {breadcrumb.map((item, index) => (
                                        <div key={index} className="flex items-center">
                                            <BreadcrumbItem className="hidden md:block whitespace-nowrap">
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
                <div className="max-w-3xl w-full mx-auto space-y-6">
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
                            {/* Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                disabled={isDetail}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter role name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                disabled={isDetail}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter role description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Permissions */}
                            <FormField
                                control={form.control}
                                name="permissions"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Permissions</FormLabel>

                                        {accessData ? (
                                            <>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    Diupdate tanggal:{" "}
                                                    {new Date(accessData._generatedAt).toLocaleDateString("id-ID", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>

                                                <div className="space-y-6">
                                                    {(groupedPermissions as any[]).map(({ group, items }) => (
                                                        <div key={group.name}>
                                                            <h3 className="text-lg font-semibold">{group.name}</h3>
                                                            <p className="text-muted-foreground text-sm mb-2">{group.description}</p>

                                                            <div className="space-y-4">
                                                                {(items as any[]).map((access) => {
                                                                    const allPermissionKeys = access.permissions.map(
                                                                        (perm: any) => `${access.id}:${perm}`
                                                                    );
                                                                    const currentPermissions = form.watch("permissions") || [];
                                                                    const allSelected = allPermissionKeys.every((perm: any) =>
                                                                        currentPermissions.includes(perm)
                                                                    );

                                                                    const togglePermissions = () => {
                                                                        const updated = allSelected
                                                                            ? currentPermissions.filter(
                                                                                (perm) => !allPermissionKeys.includes(perm)
                                                                            )
                                                                            : Array.from(new Set([...currentPermissions, ...allPermissionKeys]));
                                                                        form.setValue("permissions", updated, {
                                                                            shouldValidate: true,
                                                                        });
                                                                    };

                                                                    return (
                                                                        <div key={access.id} className="border rounded-lg px-5 py-4 space-y-2">
                                                                            <div className="flex justify-between items-start">
                                                                                <div className="space-y-0.5">
                                                                                    <div className="font-semibold text-base">{access.name}</div>
                                                                                    <p className="text-muted-foreground text-sm">
                                                                                        {access.description}
                                                                                    </p>
                                                                                </div>
                                                                                {!isDetail && (
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        className="h-7 px-2"
                                                                                        onClick={togglePermissions}
                                                                                    >
                                                                                        {allSelected ? "Unselect All" : "Select All"}
                                                                                    </Button>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex flex-wrap gap-3 mt-3">
                                                                                {access.permissions.map((perm: any) => {
                                                                                    const permissionKey = `${access.id}:${perm}`;
                                                                                    return (
                                                                                        <FormField
                                                                                            key={permissionKey}
                                                                                            control={form.control}
                                                                                            name="permissions"
                                                                                            render={({ field }) => (
                                                                                                <FormItem className="flex items-center gap-2 space-y-0">
                                                                                                    <FormControl>
                                                                                                        <Checkbox
                                                                                                            checked={field.value?.includes(permissionKey)}
                                                                                                            onCheckedChange={(checked) => {
                                                                                                                const updated = checked
                                                                                                                    ? [...(field.value || []), permissionKey]
                                                                                                                    : (field.value || []).filter(
                                                                                                                        (v) => v !== permissionKey
                                                                                                                    );
                                                                                                                field.onChange(updated);
                                                                                                            }}
                                                                                                            disabled={isDetail}
                                                                                                        />
                                                                                                    </FormControl>
                                                                                                    <FormLabel className="text-sm font-normal capitalize">
                                                                                                        {perm}
                                                                                                    </FormLabel>
                                                                                                </FormItem>
                                                                                            )}
                                                                                        />
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm text-red-500 mt-2">⚠️ Please generate access first.</p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 mt-10">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(redirect ?? "/console/roles")}
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
