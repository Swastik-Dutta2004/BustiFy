import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
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
            }, include: {
                bus: true
            }
        })

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found." },
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
            amount: booking.bus.price * 100,
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
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        )
    }
}