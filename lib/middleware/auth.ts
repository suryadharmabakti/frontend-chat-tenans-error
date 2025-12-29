import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function verifyToken(req: Request | NextRequest): any {
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
        ?.split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];

    if (!token) throw { message: "Unauthorized", statusCode: 401 };

    try {
        return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
        throw { message: "Invalid token", statusCode: 401 };
    }
}
