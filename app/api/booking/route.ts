import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json({ error: "No token provided" })
        }

        const token = authHeader.split(" ")[1];

        const decode = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: number;
            email: string;
        }

        const body = await req.json();

        if (!body.busId || !body.seatId) {
            return NextResponse.json({ error: "BusID and SeatID is required" })
        }

        const bus = await prisma.bus.findUnique({
            where:{
                id: body.busId
            }
        })

        if (!bus) {
            return NextResponse.json({error: "Bus not found"})
        }

        if (body.seatId < 1 || body.seatId > bus.totalSeats) {
            return NextResponse.json({error: "Invalid seat number"})
        }

        const existingBooking = await prisma.booking.findFirst({
            where: {
                busId: body.busId,
                seatId: body.seatId
            }
        })

        if (existingBooking) {
            return NextResponse.json({ error: "Seat is already booked" })
        }

        const booking = await prisma.booking.create({
            data: {
                userId: decode.userId,
                seatId: body.seatId,
                busId:  body.busId
            }
        })

        return NextResponse.json({
            message: "Booking successful",
            booking
        })

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.log("JWT verification failed:", error.message);
            return NextResponse.json({ error: "Invalid Token: " + error.message });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return NextResponse.json({ error: "Token expired" });
        }
        console.log("OTHER ERROR:", error);
        return NextResponse.json({ error: "Something went wrong" });

    }
}