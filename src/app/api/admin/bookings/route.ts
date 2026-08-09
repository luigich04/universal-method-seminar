import { NextResponse } from "next/server";
import {
  getAllBookingsAsync,
  saveBookingAsync,
  updateBookingNotesAsync,
  toggleAttendanceAsync,
  deleteBookingAsync,
  getCRMStatsAsync,
} from "@/lib/db";

export async function GET() {
  try {
    const bookings = await getAllBookingsAsync();
    const stats = await getCRMStatsAsync();
    return NextResponse.json({ bookings, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const record = await saveBookingAsync(body);
    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, action, notes, attended } = body;

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    if (action === "update_notes") {
      const updated = await updateBookingNotesAsync(ticketId, notes || "");
      return NextResponse.json({ success: true, updated });
    }

    if (action === "toggle_attendance") {
      const updated = await toggleAttendanceAsync(ticketId, !!attended);
      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    await deleteBookingAsync(ticketId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
