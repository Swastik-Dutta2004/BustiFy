import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"
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

        jwt.verify(token, process.env.JWT_SECRET!);

        const body = await req.json()

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: "Missing payment parameters" },
                { status: 400 }
            )
        }

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET!
            ).update(
                razorpay_order_id + "|" + razorpay_payment_id
            ).digest("hex")

        const sigBuffer = Buffer.from(generatedSignature);
        const providedBuffer = Buffer.from(razorpay_signature);

        if (sigBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(sigBuffer, providedBuffer)) {
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

        if (booking.paymentStatus === "PAID") {
            return NextResponse.json({
                message: "Payment already verified.",
                booking
            })
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
            message: "Payment successful.",
            booking: updatePayment
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
