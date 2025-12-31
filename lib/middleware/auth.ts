import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export function verifyToken(req: Request | NextRequest): any {
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
        ?.split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];

    if (!token) throw { message: "Unauthorized", statusCode: 401 };

    try {
        const devSecret = (globalThis as any).__DEV_JWT_SECRET ?? crypto.randomBytes(32).toString('hex');
        if (!(globalThis as any).__DEV_JWT_SECRET) (globalThis as any).__DEV_JWT_SECRET = devSecret;
        const jwtSecret = process.env.JWT_SECRET || devSecret;
        return jwt.verify(token, jwtSecret);
    } catch (err) {
        throw { message: "Invalid token", statusCode: 401 };
    }
}
