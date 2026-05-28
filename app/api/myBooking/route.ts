import { NextRequest, NextResponse } from "next/server";
import  jwt, { JsonWebTokenError }  from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(req:NextRequest) {
    try {
        const authHeader = req.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json(
                {error:"No token provided"},
                {status: 404}
            )
        }

        const token = authHeader.split(" ")[1]

        const decode = jwt.verify(
            token,
            process.env.jWT_SECRET!
        ) as {
            userId: number;
            email: string;
        }

        const bookings = await prisma.booking.findMany({
            where: {
                userId: decode.userId
            },
            include: {
                bus: true
            }
        })

        return NextResponse.json(
            bookings
        )

    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            return NextResponse.json(
                {error: "Invail token"},
                {status: 401}
            )
        }
    }

    return NextResponse.json(
        {error: "SOmething went wrong."},
        {status: 500}
    )
}