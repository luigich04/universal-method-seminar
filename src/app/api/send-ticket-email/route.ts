import { NextResponse } from "next/server";
import { sendConfirmationEmailAsync } from "@/lib/emailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toEmail, toName, ticketId, tierName, pdfBase64 } = body;

    if (!toEmail) {
      return NextResponse.json({ error: "Missing email address" }, { status: 400 });
    }

    const success = await sendConfirmationEmailAsync({
      toEmail,
      toName: toName || "Partecipante",
      ticketId: ticketId || "UMS-2026",
      tierName: tierName || "Full Seminar (2 Days)",
      pdfBase64,
    });

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("send-ticket-email route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
