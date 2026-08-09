import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getMySQLPool } from "@/lib/db";
import { sendConfirmationEmailAsync } from "@/lib/emailer";
import fs from "fs";
import path from "path";

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_build_key";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Verify session status with Stripe API
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session && (session.payment_status === "paid" || session.status === "complete")) {
      const customerEmail =
        session.customer_details?.email || session.customer_email || (session.metadata?.customerEmail as string);
      const customerName =
        session.customer_details?.name || (session.metadata?.customerName as string) || "Partecipante";
      const tierName = (session.metadata?.tierName as string) || "Full Seminar (2 Days)";
      const ticketId = (session.metadata?.ticketId as string) || `UMS-${sessionId.slice(-6).toUpperCase()}`;

      // Update MySQL database if available
      try {
        const pool = getMySQLPool();
        if (pool) {
          await pool.execute(
            "UPDATE bookings SET payment_status = 'PAID', updated_at = NOW() WHERE stripe_session_id = ? OR ticket_id = ?",
            [sessionId, sessionId]
          );
        }
      } catch (dbErr) {
        console.warn("MySQL update notice in stripe-confirm:", dbErr);
      }

      // Update local JSON database fallback
      const DATA_DIR = path.join(process.cwd(), "data");
      const DB_FILE = path.join(DATA_DIR, "crm_bookings.json");

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const bookings = JSON.parse(raw);
        let updated = false;

        for (const b of bookings) {
          if (b.stripeSessionId === sessionId || b.ticketId.includes(sessionId.slice(-6))) {
            b.paymentStatus = "PAID";
            b.updatedAt = new Date().toISOString();
            updated = true;
          }
        }

        if (updated) {
          fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2), "utf-8");
        }
      }

      // Send real confirmation email
      if (customerEmail) {
        await sendConfirmationEmailAsync({
          toEmail: customerEmail,
          toName: customerName,
          ticketId,
          tierName,
        });
      }

      return NextResponse.json({
        success: true,
        paymentStatus: "PAID",
        customerEmail,
        customerName,
      });
    }

    return NextResponse.json({
      success: false,
      paymentStatus: session.payment_status || "PENDING",
    });
  } catch (error: any) {
    console.error("Stripe confirm error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
