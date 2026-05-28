import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {

    // Get body
    const body = await req.json()

    //Validation Check
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json({ error: "All fields are required." })
    }

    //check existing user
    const existingUser = await prisma.user.findUnique({
      where: {
        email: body.email
      }
    })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists." })
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    //Create user
    const createUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: "passenger"
      }
    })

    // Return User data
    return NextResponse.json({
      id: createUser.id,
      name: createUser.name,
      email: createUser.email
    });


  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists." })
    }

    return NextResponse.json({ error: "Something went wrong." })
  }
}