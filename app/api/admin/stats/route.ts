import { NextRequest, NextResponse } from "next/server";
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json(
                { error: "No token has provided." },
                { status: 401 }
            )
        }

        const token = authHeader.split(" ")[1]

        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            userId: number,
            email: string,
            role: string
        }

        if (decode.role !== "admin") {
            return NextResponse.json(
                { error: "Access denied, Only admin." },
                { status: 403 }
            )
        }

        const [totalUser, totalBus, totalBooking] =
            await Promise.all([
                prisma.user.count(),
                prisma.bus.count(),
                prisma.booking.count()
            ]);

        return NextResponse.json({
            totalBooking,
            totalBus,
            totalUser
        })

    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            return NextResponse.json(
                { error: "Invaild token." },
                { status: 401 }
            )
        }
        return NextResponse.json(
            { error: "Somethink went wrong." },
            { status: 500 }
        )
    }
}