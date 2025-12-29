import { NextRequest, NextResponse } from "next/server";
import { deleteData, getDataById, updateData } from "../../logic/roles";
import { ResponseHelper } from "@/lib/helper/response.helper";
import { verifyToken } from "@/lib/middleware/auth";
import { hasPermission } from "@/lib/permission/check";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // verify token & permission
        const token = verifyToken(req);
        if (!token) throw { message: "Unauthorized", statusCode: 401 };
        if (!hasPermission(token, "role:read")) throw { message: "Forbidden", statusCode: 403 };

        // GET by ID
        const result = await getDataById(params.id);
        if (result.error) throw { message: result.message, statusCode: result.statusCode };

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        const err = ResponseHelper.handleError(error, "GET /api/users");
        return NextResponse.json(err, { status: err.statusCode || 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // verify token & permission
        const token = verifyToken(req);
        if (!token) throw { message: "Unauthorized", statusCode: 401 };
        if (!hasPermission(token, "role:update")) throw { message: "Forbidden", statusCode: 403 };

        const body = await req.json();
        const result = await updateData({ ...body, id: params.id });
        if (result.error) throw { message: result.message, statusCode: result.statusCode };

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        const err = ResponseHelper.handleError(error, "PUT /api/users/[id]");
        return NextResponse.json(err, { status: err.statusCode || 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // verify token & permission
        const token = verifyToken(req);
        if (!token) throw { message: "Unauthorized", statusCode: 401 };
        if (!hasPermission(token, "role:delete")) throw { message: "Forbidden", statusCode: 403 };

        const result = await deleteData(params.id);
        if (result.error) throw { message: result.message, statusCode: result.statusCode };

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        const err = ResponseHelper.handleError(error, "DELETE /api/users");
        return NextResponse.json(err, { status: err.statusCode || 500 });
    }
}