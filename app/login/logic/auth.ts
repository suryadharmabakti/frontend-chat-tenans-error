import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function authenticateUser(email: string, password: string) {
    const user = await prisma.users.findUnique({
        where: { email },
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return {
        id: user.id,
        email: user.email,
        name: user.full_name,
    };
}