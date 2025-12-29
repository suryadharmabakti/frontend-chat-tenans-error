// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcrypt";

// export async function authenticateUser(email: string, password: string) {
//     const user = await prisma.user.findUnique({
//         where: { email },
//     });

//     if (!user) return null;

//     const isValid = await bcrypt.compare(password, user.password);
//     if (!isValid) return null;

//     const userRole = await prisma.userRole.findUnique({
//         where: { user_id: user.uuid },
//         include: {
//             role: true,
//         },
//     });

//     return {
//         uuid: user.uuid,
//         email: user.email,
//         name: user.name,
//         role: userRole?.role.name,
//         permissions: userRole?.role.permissions,
//     };
// }

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function authenticateUser(email: string, password: string) {
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) return null;

    // Bandingkan password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return {
        id: user.id,
        email: user.email,
        name: user.name,
    };
}
