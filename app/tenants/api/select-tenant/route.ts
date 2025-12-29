import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { selectTenant } from "../../logic/tenant";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tenant_id } = body;

        const token = req.cookies.get("token")?.value;
        if (!token) throw new Error("Unauthorized");

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const fullUserData = await selectTenant(decoded.id, tenant_id);

        if (!fullUserData) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const newToken = jwt.sign(fullUserData, process.env.JWT_SECRET!, { expiresIn: "1d" });

        const response = NextResponse.json({ success: true, user: fullUserData });
        response.cookies.set("token", newToken, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
            secure: process.env.NODE_ENV === "production",
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}