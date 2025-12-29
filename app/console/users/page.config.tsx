import { FilterField } from "@/components/dynamic-filter";
import { DefaultColumnFormat } from "@/components/dynamic-table";

export const title = "User Management";
export const apiPath = "/console/users";

export const breadcrumb = [
    { name: 'User Management', href: apiPath }
]

export const pageRoute = {
    list: `${apiPath}`,
    add: `${apiPath}/add`,
    edit: (id: string) => `${apiPath}/${id}/edit`,
    details: (id: string) => `${apiPath}/${id}`,
}

export const columnFormats: DefaultColumnFormat[] = [
    {
        key: "name",
        title: "Name",
        type: "text",
        sortable: true,
        textClassName: "mx-3 text-left",
    },
    {
        key: "email",
        title: "Email",
        type: "text",
        sortable: true,
        textClassName: "mx-3 text-left",
    },
    {
        key: "role_name",
        title: "Role Name",
        type: "text",
        sortable: false,
        textClassName: "text-left",
    },
    {
        key: "tenant_name",
        title: "Tenant Name",
        type: "text",
        sortable: false,
        textClassName: "text-left",
    },
    {
        key: "created_at",
        title: "Created At",
        type: "date",
        sortable: true,
        textClassName: "mx-3 text-left",
    },
]

export const filterFields: FilterField[] = [
    {
        key: "users.name.ilike",
        label: "Name",
        type: "text",
        placeholder: "Search by name",
    },
    {
        key: "email.ilike",
        label: "Email",
        type: "text",
        placeholder: "Search by email",
    },
    {
        key: "roles.name.ilike",
        label: "Role Name",
        type: "text",
        placeholder: "Search by role",
    },
    {
        key: "tenants.name.ilike",
        label: "Tenant Name",
        type: "text",
        placeholder: "Search by tenant",
    },
    {
        key: "created_at",
        label: "Created At",
        type: "date",
    },
]