import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function  GET(req:NextRequest) {
    try {
        const authHeader = req.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json(
                {error: "Token not provided."},
                {status: 401}
            )
        }

        const token = authHeader.split(" ")[1]

        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            userId : number,
            email : string,
            role : string
        }

        if (decode.role !== "admin") {
            return NextResponse.json(
                {error: "Access denied, Only admin."},
                {status: 403}
            )
        }

        const bookings = await prisma.booking.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                id: "desc"
            }
        })

        return NextResponse.json({
            bookings
        })
        
    } catch (error) {
        
        if (error instanceof JsonWebTokenError) {
            return NextResponse.json(
                {error: "Invalid token. "},
                {status: 401}
            )
        }
        
        return NextResponse.json(
            {error: "Something went wrong."},
            {status: 500}
        )
    }
}