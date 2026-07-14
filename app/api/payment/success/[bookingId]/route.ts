import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function PATCH(req: NextRequest, context: { params: Promise<{ bookingId: string }> }) {
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

        const params = await context.params
        const bookingId = Number(params.bookingId)

        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId
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

        if (!booking.razorpayOrderId) {
            return NextResponse.json(
                { error: "No payment order found for this booking" },
                { status: 400 }
            )
        }

        const updateBooking = await prisma.booking.update({
            where: {
                id: bookingId
            }, data: {
                paymentStatus: "PAID"
            }
        })

        return NextResponse.json({
            message: "Payment successful",
            booking: updateBooking
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
