import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, context: { params: Promise<{ bookingId: string }> }) {
    try {
        const params = await context.params
        const bookingId = Number(params.bookingId)

        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId
            }
        })

        if (!booking) {
            return NextResponse.json(
                { error: "Bookings not found." },
                { status: 401 }
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
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        )
    }
}