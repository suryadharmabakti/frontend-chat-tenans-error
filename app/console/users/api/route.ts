import { NextRequest, NextResponse } from "next/server";
import { getAllData, createData } from "../logic/users";
import { ResponseHelper } from "@/lib/helper/response.helper";
import { verifyToken } from "@/lib/middleware/auth";
import { hasPermission } from "@/lib/permission/check";

export async function GET(req: NextRequest) {
    try {
        // verify token & permission
        const token = verifyToken(req);
        if (!token) throw { message: "Unauthorized", statusCode: 401 };
        if (!hasPermission(token, "user:read")) throw { message: "Forbidden", statusCode: 403 };

        const url = new URL(req.url);

        // GET all
        const payload: Record<string, any> = {};
        for (const [key, value] of url.searchParams.entries()) {
            payload[key] = isNaN(Number(value)) ? value : Number(value);
        }

        const result = await getAllData(payload);
        if (result.error) throw { message: result.message, statusCode: result.statusCode };

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        const err = ResponseHelper.handleError(error, "GET /api/users");
        return NextResponse.json(err, { status: err.statusCode || 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // verify token & permission
        const token = verifyToken(req);
        if (!token) throw { message: "Unauthorized", statusCode: 401 };
        if (!hasPermission(token, "user:create")) throw { message: "Forbidden", statusCode: 403 };

        const body = await req.json();
        const result = await createData(body);
        if (result.error) throw { message: result.message, statusCode: result.statusCode };

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        const err = ResponseHelper.handleError(error, "POST /api/users");
        return NextResponse.json(err, { status: err.statusCode || 500 });
    }
}