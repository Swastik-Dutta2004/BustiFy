import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json(
                { error: "No token provided." },
                { status: 400 }
            )
        }

        const from = req.nextUrl.searchParams.get("fromCity")
        const to = req.nextUrl.searchParams.get("toCity")

        if (!from || !to) {
            return NextResponse.json(
                { error: "From and To are required" },
                { status: 400 }
            );
        }

        const buses = await prisma.bus.findMany({
            where: {
                fromCity: from,
                toCity: to
            }
        })

        return NextResponse.json({
            message: "Found successfully.",
            buses
        })
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: "Invaild token." },
                { status: 403 }
            )
        }
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        )
    }
}