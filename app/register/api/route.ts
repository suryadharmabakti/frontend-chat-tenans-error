export const runtime = 'nodejs'

import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "../logic/register"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const result = await registerUser(body)

        return NextResponse.json(result, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 })
    }
}
