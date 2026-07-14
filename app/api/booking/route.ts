import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { calculateRouteDistance } from "@/lib/distance";
import { calculateFare } from "@/lib/fare";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json({ error: "No token provided" }, { status: 401 })
        }

        const token = authHeader.split(" ")[1];

        const decode = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: number;
            email: string;
        }

        const body = await req.json();

        if (!body.fromCity || !body.toCity || !body.busName) {
            return NextResponse.json({
                error: "From, To and BusName are required"
            }, { status: 400 });
        }

        const bus = await prisma.bus.findFirst({
            where: { busName: body.busName }
        });

        if (!bus) {
            return NextResponse.json({ error: "Bus not found" }, { status: 404 });
        }

        const allStops = [bus.fromCity, ...bus.stops, bus.toCity];
        const fromIdx = allStops.findIndex(
            (s) => s.toLowerCase() === body.fromCity.toLowerCase()
        );
        const toIdx = allStops.findIndex(
            (s) => s.toLowerCase() === body.toCity.toLowerCase()
        );

        if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) {
            return NextResponse.json(
                { error: "Invalid route for this bus" },
                { status: 400 }
            );
        }

        const routeStops = allStops.slice(fromIdx, toIdx + 1);
        const distance = calculateRouteDistance(routeStops);
        const fare = calculateFare(distance);

        const pnr = "BUS" + Math.floor(
            100000 + Math.random() * 900000
        )

        const booking = await prisma.booking.create({
            data: {
                userId: decode.userId,
                fromCity: body.fromCity,
                toCity: body.toCity,
                fare,
                pnr,
            },
        });

        return NextResponse.json({
            message: "Booking successful",
            booking
        })

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return NextResponse.json({ error: "Token expired" }, { status: 401 });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });

    }
}