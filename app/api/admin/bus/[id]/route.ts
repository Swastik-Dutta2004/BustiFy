import { NextRequest, NextResponse } from "next/server";
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { prisma } from "@/lib/prisma";

export async function  DELETE(req:NextRequest, context: { params: Promise<{ id: string }> }
) {
    try {

        const authHeader = req.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json(
                {error: "No tken provided"},
                {status: 401}
            )
        }

        const token = authHeader.split("")[1]

        const decode = await jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            userId: number,
            SeatId: string,
            role: string,
        }

        if (decode.role !== "admin") {
            return NextResponse.json(
                {error: "Access denied, Admin only"},
                {status: 403}
            )
        }

        const params = await context.params

        const busId = Number(params.id)

         if (!busId) {
            return NextResponse.json(
                { error: "Invalid bus ID" },
                { status: 400 }
            );
        }

        const bus = await prisma.bus.findMany({
            where: {
                id: busId
            }
        })

        return NextResponse.json(
            {messge: "Bus deleted successully."}
        )
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            return NextResponse.json(
                {error: "Token not provided"},
                {status: 401}
            )
        }

        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        )
    }
}