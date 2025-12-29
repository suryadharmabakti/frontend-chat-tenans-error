import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "../logic/auth";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        const user = await authenticateUser(email, password);

        if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        // Simpan user info di session cookie (contoh manual)
        const response = NextResponse.json({ success: true, user });

        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 hari
            secure: process.env.NODE_ENV === "production",
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 })
    }
}
