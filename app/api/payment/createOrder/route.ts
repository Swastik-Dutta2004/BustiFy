import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "No token provided." },
                { status: 401 }
            );
        }

        const token = authHeader.slice("Bearer ".length).trim();
        if (!token) {
            return NextResponse.json(
                { error: "No token provided." },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: number;
            email: string;
        };

        const body = await req.json()

        if (!body.bookingId) {
            return NextResponse.json(
                { error: "Booking Id is required" },
                { status: 400 }
            )
        }

        const booking = await prisma.booking.findUnique({
            where: {
                id: body.bookingId
            }
        })

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found." },
                { status: 404 }
            )
        }

        if (booking.userId !== decoded.userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            )
        }

        if (booking.paymentStatus === "PAID") {
            return NextResponse.json(
                { error: "Booking already paid" },
                { status: 400 }
            );
        }

        const order = await razorpay.orders.create({
            amount: booking.fare * 100,
            currency: "INR",
            receipt: `booking_${booking.id}`
        })

        await prisma.booking.update({
            where: {
                id: booking.id
            }, data : {
                razorpayOrderId: order.id
            }
        })

        return NextResponse.json({
            order
        })

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: "Invalid token." },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        )
    }
}
