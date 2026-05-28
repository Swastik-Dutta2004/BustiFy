import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const body = await req.json()

        if (!body.email || !body.password) {
            return NextResponse.json({ error: "All fields are required." })
        }

        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        })

        if (!user) {
            return NextResponse.json({ error: "Users not found." })
        }

        const isMatch = await bcrypt.compare(body.password, user.password)

        console.log("Entered:", body.password);
        console.log("Stored:", user.password);

        if (!isMatch) {
            return NextResponse.json({ error: "Inavaild password." })
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },  
            
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        return NextResponse.json({
            message: "Login successful",
            token
        });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Something went wrong" })
    }
}