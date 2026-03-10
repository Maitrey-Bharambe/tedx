import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import TempRegistration from "@/models/tempRegisterationModel";

export async function POST(req) {
  try {
    const { fullName, phoneNumber, email, seat, userId } = await req.json();

    // Basic validation
    if (!fullName || !phoneNumber || !email || !seat) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }
    if (!/^[6-9]\d{9}$/.test(phoneNumber.replace(/\s+/g, ""))) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit Indian mobile number." },
        { status: 400 },
      );
    }
    if (!["general", "premium", "vip"].includes(seat)) {
      return NextResponse.json(
        { error: "Invalid seat type." },
        { status: 400 },
      );
    }

    await connectMongo();

    const existing = await TempRegistration.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 409 },
      );
    }

    await TempRegistration.create({
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.replace(/\s+/g, ""),
      email: email.toLowerCase().trim(),
      seat,
      userId: userId || null,
    });

    return NextResponse.json(
      { message: "Registered successfully." },
      { status: 201 },
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
