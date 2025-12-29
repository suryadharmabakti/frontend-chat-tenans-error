
import { accessDefinitions } from "@/lib/access-definitions"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt"

// export async function registerUser(data: {
//     name: string
//     email: string
//     tenant: string
//     password: string
// }) {
//     const { name, email, tenant, password } = data

//     // Cek email
//     const existing = await prisma.user.findUnique({ where: { email } })
//     if (existing) throw new Error("Email already registered")

//     // Cek nama tenant
//     const existingTenant = await prisma.tenant.findFirst({ where: { name: tenant } })
//     if (existingTenant) throw new Error("Tenant name is already in use")

//     // Buat tenant
//     const newTenant = await prisma.tenant.create({ data: { name: tenant } })

//     // Hash password
//     const hashed = await hash(password, 10)

//     // Buat user
//     const newUser = await prisma.user.create({
//         data: {
//             name,
//             email,
//             password: hashed,
//         },
//     })

//     // Buat UserTenant
//     await prisma.userTenant.create({
//         data: {
//             user_id: newUser.uuid,
//             tenant_id: newTenant.uuid,
//             is_active: true,
//         },
//     })

//     const structuredPermissions: Record<string, any> = {}

//     for (const def of accessDefinitions) {
//         if (def.id) structuredPermissions[def.id] = def.permissions;
//     }

//     // Buat default role (misal: owner)
//     const ownerRole = await prisma.role.create({
//         data: {
//             name: "Owner",
//             description: `Owner of ${tenant}`,
//             tenant_id: newTenant.uuid,
//             permissions: structuredPermissions,
//         },
//     })

//     // Hubungkan user ke role
//     await prisma.userRole.create({
//         data: {
//             user_id: newUser.uuid,
//             role_id: ownerRole.uuid,
//         },
//     })

//     return {
//         message: "User registered successfully",
//         user: {
//             uuid: newUser.uuid,
//             email: newUser.email,
//             name: newUser.name,
//         },
//     }
// }

export async function registerUser(data: {
    name: string
    email: string
    tenant: string
    password: string
}) {
    const { name, email, tenant, password } = data

    // Cek email
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error("Email already registered")

    // Cek nama tenant
    const existingTenant = await prisma.tenant.findFirst({ where: { name: tenant } })
    if (existingTenant) throw new Error("Tenant name is already in use")

    // Buat tenant
    const newTenant = await prisma.tenant.create({ data: { name: tenant } })

    // Hash password
    const hashed = await hash(password, 10)

    // Buat user
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashed,
        },
    })

    // Siapkan permission
    const structuredPermissions: Record<string, any> = {}
    for (const def of accessDefinitions) {
        if (def.id) structuredPermissions[def.id] = def.permissions
    }

    // Buat role default untuk tenant ini (Owner)
    const ownerRole = await prisma.role.create({
        data: {
            name: "Owner",
            tenant_id: newTenant.id,
            permissions: structuredPermissions,
        },
    })

    // Buat UserTenant sekaligus hubungkan ke role
    await prisma.userTenant.create({
        data: {
            user_id: newUser.id,
            tenant_id: newTenant.id,
            role_id: ownerRole.id,
        },
    })

    return {
        message: "User registered successfully",
        user: {
            uuid: newUser.id,
            email: newUser.email,
            name: newUser.name,
        },
    }
}
