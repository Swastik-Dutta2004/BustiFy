import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = body

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET!
            ).update(
                razorpay_order_id + "|" + razorpay_payment_id
            ).digest("hex")

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: "Invalid payment signature" },
                { status: 400 }
            )
        }
        
        const booking = await prisma.booking.findFirst({
            where: {
                razorpayOrderId: razorpay_order_id
            }
        })

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            )
        }

        const updatePayment = await prisma.booking.update({
            where: {
                id: booking.id
            }, data: {
                paymentStatus: "PAID",
                razorpayPaymentId: razorpay_payment_id
            }
        })

        return NextResponse.json({
            message: "Payment successfully." ,
            booking: updatePayment
        })


    } catch (error) {
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        )
    }
}