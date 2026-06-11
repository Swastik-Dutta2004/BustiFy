import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ pnr: string }> }
) {
    try {
        const params = await context.params

        const booking = await prisma.booking.findUnique({
            where: {
                pnr: params.pnr
            },

            include: {
                user: true
            }
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            booking
        )

    } catch (error) {
        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        )
    }
}