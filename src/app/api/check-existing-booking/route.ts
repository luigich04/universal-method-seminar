import { NextResponse } from "next/server";
import { getAllBookingsAsync } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ alreadyPaid: false });
    }

    const bookings = await getAllBookingsAsync();
    const existing = bookings.find(
      (b) => b.email.trim().toLowerCase() === email.trim().toLowerCase() && b.paymentStatus === "PAID"
    );

    if (existing) {
      return NextResponse.json({
        alreadyPaid: true,
        existingTicketId: existing.ticketId,
        existingName: existing.fullName,
        existingTier: existing.tierName,
      });
    }

    return NextResponse.json({ alreadyPaid: false });
  } catch (error: any) {
    console.error("Error checking existing booking:", error);
    return NextResponse.json({ alreadyPaid: false });
  }
}
