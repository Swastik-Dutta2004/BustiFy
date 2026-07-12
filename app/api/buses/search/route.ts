import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
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

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set");
            return NextResponse.json(
                { error: "Something went wrong." },
                { status: 500 }
            );
        }

        // This actually verifies the signature/expiry now — previously the
        // token was never checked, only its presence.
        jwt.verify(token, process.env.JWT_SECRET);

        const from = req.nextUrl.searchParams.get("fromCity")?.trim();
        const to = req.nextUrl.searchParams.get("toCity")?.trim();

        if (!from || !to) {
            return NextResponse.json(
                { error: "From and To are required" },
                { status: 400 }
            );
        }

        if (from.toLowerCase() === to.toLowerCase()) {
            return NextResponse.json(
                { error: "From and To cannot be the same." },
                { status: 400 }
            );
        }

        console.log("Searching from:", from);
        console.log("Searching to:", to);


        const buses = await prisma.bus.findMany({
            where: {
                AND: [
                    { stops: { has: from } },
                    { stops: { has: to } },
                ],
            },
        });
        
        const validBuses = buses.filter((bus) => {
            const fromIndex = bus.stops.indexOf(from);
            const toIndex = bus.stops.indexOf(to);

            return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
        });

        return NextResponse.json({
            message: "Found successfully.",
            validBuses,
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: "Invalid token." },
                { status: 403 }
            );
        }
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}