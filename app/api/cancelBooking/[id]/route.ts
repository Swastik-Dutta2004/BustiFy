import { NextRequest, NextResponse } from "next/server";
import Jwt, { JsonWebTokenError } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
    
export async function DELETE(req:NextRequest, {params} : {params: {id : String}}) {
    try {
        
        const authHeader = req.headers.get("authentication")

        if (!authHeader) {
            return NextResponse.json(
                {error:"No token provided"},
                {status: 404}
            )
        }

        const token = authHeader.split(" ")[1]

        const decode = Jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            userId: string,
            email: string
        }

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
        if (error instanceof Jwt.JsonWebTokenError) {
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