import { accessDefinitions } from "@/lib/access-definitions";
import { buildPaginatedQuery } from "@/lib/helper/pagination-query.helper";
import { ResponseHelper } from "@/lib/helper/response.helper";
import { prisma } from "@/lib/prisma";

export async function getAllData(payload: Record<string, any>) {
    try {
        if (!process.env.DATABASE_URL) {
            return ResponseHelper.handleSuccess([], "Tenant fetched successfully", +payload.page || 1, 0, +payload.limit || 10);
        }
        const baseQuery = `
            select tenants.*
            from tenants
            join user_tenants on user_tenants.tenant_id = tenants.id
            join users on users.id = user_tenants.user_id
        `;

        const res = await buildPaginatedQuery({
            payload,
            baseQuery,
            tableName: "tenants",
            dataSource: prisma,
            responseHelper: ResponseHelper,
            serviceName: "TenantService",
        });

        if (!res.success) throw Error(res.error)
        return res;
    } catch (err) {
        return ResponseHelper.handleSuccess([], "Tenant fetched successfully", +payload.page || 1, 0, +payload.limit || 10);
    }
}

export async function getDataById(id: string) {
    if (!id) throw Error("Tenant ID is required");

    try {
        const data: any[] = await prisma.$queryRaw`
            select 
                id,
                name
            from tenants 
            where id = ${id}
        `;

        if (!data.length) {
            return ResponseHelper.handleError(
                { status: 404, message: "Tenant not found" },
                "Failed to get tenant by id"
            );
        }

        const tenant = data[0];

        return ResponseHelper.handleSuccess(tenant, "Tenant fetched successfully");
    } catch (error) {
        return ResponseHelper.handleError(error, "Failed to tenant by id");
    }
}

export async function createData(data: any) {
    try {
        const { name, user_id } = data;

        const tenant = await prisma.tenant.create({
            data: {
                name,
            },
        });

        // Siapkan permission
        const structuredPermissions: Record<string, any> = {}
        for (const def of accessDefinitions) {
            if (def.id) structuredPermissions[def.id] = def.permissions
        }

        const ownerRole = await prisma.role.create({
            data: {
                name: "Owner",
                tenant_id: tenant.id,
                permissions: structuredPermissions,
            },
        })

        await prisma.userTenant.create({
            data: {
                user_id,
                tenant_id: tenant.id,
                role_id: ownerRole.id
            }
        })

        return ResponseHelper.handleSuccess(tenant, "Tenant created successfully");
    } catch (err) {
        throw ResponseHelper.handleError(err, "Failed to create tenant");
    }
}

export async function deleteData(id: string) {
    if (!id) throw Error("Tenant ID is required");

    try {
        await prisma.tenant.delete({ where: { id } });
        return ResponseHelper.handleSuccess(null, "Tenant deleted successfully");
    } catch (err) {
        throw ResponseHelper.handleError(err, "Failed to delete tenant");
    }
}

export async function selectTenant(user_id: string, tenant_id: string) {
    if (!process.env.DATABASE_URL) {
        return {
            id: user_id,
            email: "",
            name: "",
            tenant_id,
            role: "Owner",
            permissions: {},
        };
    }
    const user = await prisma.user.findUnique({
        where: { id: user_id },
    });

    if (!user) return null;

    const userTenant = await prisma.userTenant.findUnique({
        where: {
            user_id_tenant_id: {
                user_id,
                tenant_id,
            },
        },
        include: {
            user: true,
            role: true,
        },
    });

    if (!userTenant) return null;

    return {
        id: userTenant.user.id,
        email: userTenant.user.email,
        name: userTenant.user.name,
        tenant_id,
        role: userTenant.role.name,
        permissions: userTenant.role.permissions,
    };
}
