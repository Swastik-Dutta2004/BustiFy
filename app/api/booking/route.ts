    import { NextResponse } from "next/server";
    import jwt from "jsonwebtoken";
    import { prisma } from "@/lib/prisma";

    export async function POST(req: Request) {
        try {
            const authHeader = req.headers.get("authorization")

            if (!authHeader) {
                return NextResponse.json({ error: "No token provided" })
            }

            const token = authHeader.split(" ")[1];

            const decode = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: number;
                email: string;
            }

            const body = await req.json();

            if (!body.fromCity || !body.toCity || !body.fare) {
                return NextResponse.json({
                    error: "From, To and Fare are required"
                });
            }

            const pnr = "BUS" + Math.floor(
                100000 + Math.random() * 900000
            )

            const booking = await prisma.booking.create({
                data: {
                    userId: decode.userId,
                    fromCity: body.fromCity,
                    toCity: body.toCity,
                    fare: body.fare,
                    pnr,
                },
            });

            return NextResponse.json({
                message: "Booking successful",
                booking
            })

        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                console.log("JWT verification failed:", error.message);
                return NextResponse.json({ error: "Invalid Token: " + error.message });
            }
            if (error instanceof jwt.TokenExpiredError) {
                return NextResponse.json({ error: "Token expired" });
            }
            console.log("OTHER ERROR:", error);
            return NextResponse.json({ error: "Something went wrong" });

        }
    }