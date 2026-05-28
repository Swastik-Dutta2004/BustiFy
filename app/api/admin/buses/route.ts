import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { prisma } from "@/lib/prisma";

export async function GET(req:NextRequest) {
    try {
        const authHeader = req.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json(
                {error: "Token not provided"},
                {status: 401}
            )
        }

        const token = authHeader.split(" ")[1]

        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            userId : string,
            email : string,
            role : string
        }

        if (decode.role !== "admin") {
            return NextResponse.json(
                {error: "Access denied, Only admin are allowed"},
                {status: 403}
            )
        }

        const buses = await prisma.bus.findMany({
            include: {
                bookings: {
                    select: {
                        id: true,
                        userId: true,
                        pnr: true
                    }
                }
            }
        })

        return NextResponse.json(
            buses
        )
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            return NextResponse.json(
                {error: "Invalid token"},
                {status: 401}
            )
        }

        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        )
    }
}