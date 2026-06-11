import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    try {
        
        const busId = Number(req.nextUrl.searchParams.get("busId")) 

        if (!busId) {
            return NextResponse.json(
                {error: "Bus Id is required."},
                {status: 400}

            )
        }

        const bus = await prisma.bus.findUnique({
            where: {
                id: busId
            }
        })

        if (!bus) {
            return NextResponse.json(
                {error: "Bus not found."},
                {status: 404}
            )
        }

        return NextResponse.json({
            totalSeats: bus.totalSeats,
            bookingSeats: []
        })

    } catch (error) {
        return NextResponse.json(
            {error: "Something went wrong."},
            {status: 500}
        )
    }
}