import { FilterField } from "@/components/dynamic-filter";
import { DefaultColumnFormat } from "@/components/dynamic-table";

export const title = "Role Management";
export const apiPath = "/console/roles";

export const breadcrumb = [
    { name: 'Role Management', href: apiPath }
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
        key: "description",
        title: "Description",
        type: "text",
        sortable: true,
        textClassName: "mx-3 text-left",
    },
    {
        key: "tenant_name",
        title: "Tenant Name",
        type: "text",
        sortable: false,
        textClassName: "mx-3 text-left",
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
        key: "roles.name.ilike",
        label: "Name",
        type: "text",
        placeholder: "Search by name",
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