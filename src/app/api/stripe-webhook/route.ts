import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getMySQLPool } from "@/lib/db";
import fs from "fs";
import path from "path";

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_build_key";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(body);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;

      // Update MySQL database
      try {
        const pool = getMySQLPool();
        if (pool) {
          await pool.execute(
            "UPDATE bookings SET payment_status = 'PAID', updated_at = NOW() WHERE stripe_session_id = ? OR ticket_id = ?",
            [sessionId, sessionId]
          );
        }
      } catch (dbErr) {
        console.warn("MySQL webhook update notice:", dbErr);
      }

      // Update JSON fallback
      const DATA_DIR = path.join(process.cwd(), "data");
      const DB_FILE = path.join(DATA_DIR, "crm_bookings.json");

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const bookings = JSON.parse(raw);
        let updated = false;

        for (const b of bookings) {
          if (b.stripeSessionId === sessionId) {
            b.paymentStatus = "PAID";
            b.updatedAt = new Date().toISOString();
            updated = true;
          }
        }

        if (updated) {
          fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2), "utf-8");
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
