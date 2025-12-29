import { Prisma, PrismaClient } from "@prisma/client";
import { buildPaginatedQuery } from "@/lib/helper/pagination-query.helper";
import { ResponseHelper } from "@/lib/helper/response.helper";
import { hash } from "bcrypt"

const prisma = new PrismaClient();

export async function getAllData(payload: Record<string, any>) {
    try {
        const baseQuery = `
            select 
                users.id,
                users.name,
                users.email,
                users.created_at,
                tenants.id as tenant_id,
                tenants.name as tenant_name,
                roles.id as role_id,
                roles.name as role_name
            from users
            join user_tenants on users.id = user_tenants.user_id
            join tenants on tenants.id = user_tenants.tenant_id
            join roles on roles.id = user_tenants.role_id
        `;

        const res = await buildPaginatedQuery({
            payload,
            baseQuery,
            tableName: "users",
            dataSource: prisma,
            responseHelper: ResponseHelper,
            serviceName: "UserService",
        });

        if (!res.success) throw Error(res.error)
        return res;
    } catch (err) {
        throw ResponseHelper.handleError(err, "Failed to get user");
    }
}

export async function getDataById(id: string) {
    if (!id) throw Error("User ID is required");

    try {
        const data: any[] = await prisma.$queryRaw`
            select 
                users.id,
                users.email,
                users.name,
                tenants.id as tenant_id,
                tenants.name as tenant_name,
                roles.id as role_id,
                roles.name as role_name
            from users 
            join user_tenants on users.id = user_tenants.user_id
            join tenants on tenants.id = user_tenants.tenant_id
            join roles on roles.id = user_tenants.role_id
            where users.id::text = ${id}
        `;

        if (!data.length) {
            return ResponseHelper.handleError(
                { status: 404, message: "User not found" },
                "Failed to get user by id"
            );
        }

        return ResponseHelper.handleSuccess(data[0], "User fetched successfully");
    } catch (error) {
        return ResponseHelper.handleError(error, "Failed to get user by id");
    }
}

export async function createData(data: any) {
    try {
        const { name, email, tenant_id, role_id, password } = data
        if (!tenant_id) throw Error("Tenant ID is required");
        if (!role_id) throw Error("Role ID is required");

        return await prisma.$transaction(async (tx) => {
            // Cek apakah email sudah terdaftar
            const existing = await tx.user.findUnique({
                where: { email },
            });

            if (existing) {
                throw new Error("Email already registered");
            }

            // Hash password
            const hashed = await hash(password, 10);

            // Buat user
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashed,
                },
            });

            // Cari role default untuk tenant
            const role = await tx.role.findFirst({
                where: { id: role_id, tenant_id },
            });

            if (!role) throw new Error("Default role not found for tenant");

            // Tambahkan ke userTenants
            await tx.userTenant.create({
                data: {
                    user_id: user.id,
                    tenant_id,
                    role_id: role.id,
                },
            });

            return ResponseHelper.handleSuccess(user, "User created successfully");
        })
    } catch (err) {
        throw ResponseHelper.handleError(err, "Failed to create user");
    }
}

export async function updateData(
    data: Prisma.UserUpdateInput & { id: string; role_id?: string; tenant_id?: string }
) {
    const { id, password, role_id, tenant_id, ...rest } = data;
    if (!id) throw new Error("User ID is required");

    return await prisma.$transaction(async (tx) => {
        const updateData: Prisma.UserUpdateInput = { ...rest };

        // Hash password jika ada
        if (password && typeof password === "string" && password.trim() !== "") {
            const hashed = await hash(password, 10);
            updateData.password = hashed;
        }

        const user = await tx.user.update({
            where: { id },
            data: updateData,
        });

        // Update userTenant jika role_id atau tenant_id diubah
        if (role_id || tenant_id) {
            const existingUT = await tx.userTenant.findFirst({
                where: { user_id: id },
            });

            if (!existingUT) {
                throw new Error("UserTenant relationship not found");
            }

            await tx.userTenant.update({
                where: { id: existingUT.id },
                data: {
                    ...(role_id && { role_id }),
                    ...(tenant_id && { tenant_id }),
                },
            });
        }

        return ResponseHelper.handleSuccess(user, "User updated successfully");
    });
}

export async function deleteData(id: string) {
    if (!id) throw Error("User ID is required");

    return await prisma.$transaction(async (tx) => {
        // Hapus semua relasi userTenant terlebih dahulu
        await tx.userTenant.deleteMany({
            where: { user_id: id },
        });

        // Lalu hapus user-nya
        await tx.user.delete({
            where: { id },
        });

        return ResponseHelper.handleSuccess(null, "User deleted successfully");
    });
}
