import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json()

        if (
            !body.busName ||
            !body.fromCity ||
            !body.toCity ||
            !body.departureTime ||
            !body.arrivalTime ||
            body.price == null ||
            body.totalSeats == null
        ) {
            return NextResponse.json({
                error: "All fields are required"
            })
        }

        const bus = await prisma.bus.create({
            data: {
                busName: body.busName,
                fromCity: body.fromCity,
                toCity: body.toCity,
                departureTime: body.departureTime,
                arrivalTime: body.arrivalTime,
                price: body.price,
                totalSeats: body.totalSeats
                
            }
        })

        return NextResponse.json({
            message: "Bus created",
            bus
        })

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" })
    }

}