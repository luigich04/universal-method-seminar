import { NextResponse } from "next/server";
import Stripe from "stripe";
import { saveBookingAsync } from "@/lib/db";

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_build_key";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tierName,
      price,
      customerEmail,
      customerName,
      phone,
      martialSystem,
      experienceLevel,
      tierKey,
    } = body;

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "klarna", "paypal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Universal Method Seminar — ${tierName}`,
              description: "Bracciano, Italy • 7 & 8 September 2026",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: customerEmail ? customerEmail : undefined,
      success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        customerName: customerName || "",
        phone: phone || "",
        martialSystem: martialSystem || "",
        experienceLevel: experienceLevel || "",
        tierName: tierName || "",
      },
    });

    // Record initial booking in internal CRM database with status PENDING
    await saveBookingAsync({
      ticketId: `UMS-${Math.floor(1000 + Math.random() * 9000)}`,
      stripeSessionId: session.id,
      fullName: customerName || "Partecipante",
      email: customerEmail || "iscritto@example.com",
      phone: phone || "",
      martialSystem: martialSystem || "BJJ",
      experienceLevel: experienceLevel || "Intermediate",
      tierKey: tierKey || "full",
      tierName: tierName || "Full Seminar (2 Days)",
      amountPaid: price,
      currency: "EUR",
      paymentStatus: "PENDING",
      paymentMethod: "stripe",
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error: any) {
    console.error("Stripe Checkout Session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe session" },
      { status: 500 }
    );
  }
}
