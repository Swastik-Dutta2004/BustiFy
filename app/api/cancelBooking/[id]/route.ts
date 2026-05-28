import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
    
export async function DELETE(req:NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        
        const authHeader = req.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json(
                {error:"No token provided"},
                {status: 404}
            )
        }

        const token = authHeader.split(" ")[1]

        const decode = jwt.verify(
            token,
            process.env.jWT_SECRET!
        ) as {
            userId: string,
            email: string
        }

        const params = await context.params
        const bookingId = Number(params.id)

        if (!bookingId) {
            return NextResponse.json(
                {error: "Invaild booking Id"},
                {status: 400}
            )
        }

        const booking = await prisma.booking.findUnique({
            where:{
                id: bookingId
            }
        })

        if (!booking) {
            return NextResponse.json(
                {error: "Booking not found"},
                {status: 404}
            )
        }

        if (booking.userId !== Number(decode.userId)) {
            return NextResponse.json(
                {error: "Unauthorised"},
                {status:403}
            )
        }

        return NextResponse.json({
            message: "Booking cancelled successfully"       
        })

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                {error: "Invail token"},
                {status:401}
            )
        }

        return NextResponse.json(
            {error: "Something went wrong"},
            {status:500}
        )
    }
}