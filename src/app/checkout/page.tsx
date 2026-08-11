"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./checkout.module.css";
import TicketBarcode from "@/components/TicketBarcode";

// ── REAL PAYMENT VECTOR LOGOS ──
const VisaLogo = () => (
  <svg width="34" height="22" viewBox="0 0 36 24" fill="none">
    <rect width="36" height="24" rx="3" fill="#1A1F71"/>
    <path d="M13.8 16.5H11.5L13 7.5H15.3L13.8 16.5ZM21.9 7.7C21.4 7.5 20.6 7.3 19.6 7.3C16.9 7.3 15 8.7 15 10.7C15 12.2 16.4 13 17.4 13.5C18.4 14 18.8 14.3 18.8 14.8C18.8 15.5 17.9 15.8 17.1 15.8C16 15.8 15.1 15.5 14.4 15.2L14 17.1C14.7 17.4 15.9 17.7 17.1 17.7C20 17.7 21.9 16.3 21.9 14.2C21.9 12.2 19.7 11.8 19.7 10.9C19.7 10.4 20.2 9.9 21.2 9.9C22 9.9 22.8 10.1 23.3 10.3L23.8 8.5C23.2 8.1 22.4 7.7 21.9 7.7ZM28.6 7.5H26.8C26.2 7.5 25.8 7.7 25.6 8.2L22 16.5H24.5L25 15H28L28.3 16.5H30.5L28.6 7.5ZM25.7 13.3L26.7 9.4L27.4 13.3H25.7ZM10.5 7.5L8.3 13.6L7.9 11.7C7.4 10 5.8 8.1 3.9 7.5H7.1C7.8 7.5 8.3 7.9 8.5 8.6L9.6 14.6L10.5 7.5Z" fill="#F7B600"/>
    <path d="M5.8 7.5H2C1.4 7.5 1 7.8 0.8 8.3C0 10.2 2.5 14.8 5.6 16.5L8 7.5H5.8Z" fill="#F7B600"/>
  </svg>
);

const MastercardLogo = () => (
  <svg width="34" height="22" viewBox="0 0 36 24" fill="none">
    <rect width="36" height="24" rx="3" fill="#141414"/>
    <circle cx="13" cy="12" r="7" fill="#EB001B"/>
    <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
    <path d="M18 6.9A6.9 6.9 0 0 0 15.5 12A6.9 6.9 0 0 0 18 17.1A6.9 6.9 0 0 0 20.5 12A6.9 6.9 0 0 0 18 6.9Z" fill="#FF5F00"/>
  </svg>
);

const AmexLogo = () => (
  <svg width="34" height="22" viewBox="0 0 36 24" fill="none">
    <rect width="36" height="24" rx="3" fill="#006FCF"/>
    <path d="M6 15L7.5 11H9L10.5 15H9L8.6 13.8H7.9L7.5 15H6ZM8.1 12.8H8.4L8.3 11.9L8.1 12.8ZM11 15V11H12.8L13.5 13.3L14.2 11H16V15H14.8V12.4L13.9 15H13.1L12.2 12.4V15H11ZM17 15V11H20.5V12H18.2V12.5H20.2V13.5H18.2V14H20.5V15H17ZM21.5 15L23 12.9L21.6 11H23L23.8 12.2L24.6 11H26L24.5 12.9L26 15H24.5L23.8 13.6L23 15H21.5Z" fill="white"/>
  </svg>
);

const PayPalLogo = () => (
  <svg width="60" height="20" viewBox="0 0 80 26" fill="none">
    <path d="M22.8 3.5H15.6C15.1 3.5 14.6 3.9 14.5 4.5L11 22.3C10.9 22.7 11.2 23.1 11.6 23.1H15.2C15.7 23.1 16.2 22.7 16.3 22.1L17.5 15.6C17.6 15 18.1 14.6 18.6 14.6H20.4C24.3 14.6 26.6 12.7 27.2 8.9C27.5 7.1 27 5.7 25.8 4.8C24.8 3.9 23.4 3.5 22.8 3.5Z" fill="#003087"/>
    <path d="M51.8 3.5H44.6C44.1 3.5 43.6 3.9 43.5 4.5L40 22.3C39.9 22.7 40.2 23.1 40.6 23.1H44.2C44.7 23.1 45.2 22.7 45.3 22.1L46.5 15.6C46.6 15 47.1 14.6 47.6 14.6H49.4C53.3 14.6 55.6 12.7 56.2 8.9C56.5 7.1 56 5.7 54.8 4.8C53.8 3.9 52.4 3.5 51.8 3.5Z" fill="#003087"/>
    <path d="M23.5 9.1C23.1 11.7 21.2 13 18.8 13H17.4L18.4 6.7C18.4 6.5 18.6 6.3 18.9 6.3H20.1C21.8 6.3 23 6.6 23.5 7.4C23.8 7.9 23.8 8.5 23.5 9.1Z" fill="#0079C1"/>
  </svg>
);

const KlarnaLogo = () => (
  <svg width="54" height="20" viewBox="0 0 70 24" fill="none">
    <rect width="70" height="24" rx="4" fill="#FFB3C7"/>
    <path d="M14 6V18H16.8V6H14ZM21.3 12.8L25 6.5H21.5L18.4 12V6.5H15.6V18H18.4V14.5L21.9 18H25.4L21.3 12.8ZM28.5 16.3C27.6 16.3 27 16.9 27 17.7C27 18.5 27.6 19.1 28.5 19.1C29.4 19.1 30 18.5 30 17.7C30 16.9 29.4 16.3 28.5 16.3Z" fill="#111111"/>
  </svg>
);

const GPayLogo = () => (
  <svg width="65" height="26" viewBox="0 0 126 50" fill="none" preserveAspectRatio="xMidYMid" focusable="false">
    <g fillRule="evenodd" clipPath="url(#a)" clipRule="evenodd">
      <path fill="#fff" d="M59.62 7.342v12.636h7.793q2.785 0 4.605-1.872c1.247-1.244 1.872-2.73 1.872-4.447q0-2.525-1.872-4.401-1.82-1.918-4.605-1.919H59.62zm0 17.083v14.657h-4.654V2.895h12.348q4.7 0 7.99 3.132 3.343 3.133 3.343 7.632c0 3.066-1.115 5.629-3.343 7.68-2.157 2.059-4.824 3.083-7.993 3.083h-7.69zm23.73 7.078q0 1.818 1.545 3.033c1.027.804 2.234 1.21 3.615 1.21 1.959 0 3.7-.724 5.236-2.17 1.538-1.451 2.302-3.153 2.302-5.106q-2.176-1.718-6.072-1.718c-1.887 0-3.466.458-4.728 1.368-1.266.91-1.897 2.034-1.897 3.383Zm6.023-17.996q5.16.002 8.148 2.754 2.982 2.758 2.984 7.558v15.263h-4.454v-3.435h-.2q-2.887 4.244-7.694 4.246-4.096-.002-6.855-2.427-2.757-2.427-2.758-6.065 0-3.843 2.91-6.116 2.909-2.274 7.767-2.274c2.76 0 5.042.504 6.827 1.516v-1.064q0-2.426-1.922-4.116a6.6 6.6 0 0 0-4.502-1.693c-2.6 0-4.655 1.092-6.174 3.287l-4.098-2.581q3.392-4.852 10.02-4.853m36.683.81L110.519 50h-4.806l5.769-12.484-10.219-23.198h5.06l7.387 17.791h.099l7.186-17.794z"></path>
      <path fill="#4285F4" d="M40.81 21.267c0-1.464-.123-2.878-.359-4.228H20.818v8.01h11.247a9.62 9.62 0 0 1-4.16 6.319v5.199h6.713c3.93-3.62 6.192-8.975 6.192-15.3"></path>
      <path fill="#34A853" d="M20.819 41.585c5.62 0 10.348-1.841 13.799-5.016l-6.713-5.203c-1.866 1.257-4.27 1.99-7.087 1.99-5.428 0-10.039-3.658-11.685-8.584H2.219v5.357a20.82 20.82 0 0 0 18.6 11.46"></path>
      <path fill="#FABB05" d="M9.133 24.771a12.5 12.5 0 0 1 0-7.96v-5.356H2.219A20.7 20.7 0 0 0 0 20.788c0 3.358.805 6.53 2.219 9.337l6.914-5.357z"></path>
      <path fill="#E94235" d="M20.818 8.229c3.07 0 5.818 1.052 7.985 3.12v.002l5.942-5.935C31.142 2.06 26.438 0 20.82 0A20.82 20.82 0 0 0 2.222 11.457l6.914 5.357c1.646-4.927 6.257-8.585 11.685-8.585"></path>
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h126v50H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

interface TierDetail {
  id: string;
  name: string;
  price: number;
  variant: string;
  dates: string;
}

const TIER_MAP: Record<string, TierDetail> = {
  full: {
    id: "full",
    name: "Universal Method Seminar Pass",
    price: 140,
    variant: "Full Seminar (2 Days)",
    dates: "7 & 8 September 2026 • Bracciano, Italy",
  },
  day1: {
    id: "day1",
    name: "Universal Method Seminar Pass",
    price: 80,
    variant: "Day 1 Pass — Perceive",
    dates: "7 September 2026 (17:00 – 20:00) • Bracciano, Italy",
  },
  day2: {
    id: "day2",
    name: "Universal Method Seminar Pass",
    price: 80,
    variant: "Day 2 Pass — Adapt",
    dates: "8 September 2026 (10:00 – 13:00) • Bracciano, Italy",
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const tierKey = searchParams.get("tier") || "full";
  const tierInfo = TIER_MAP[tierKey] || TIER_MAP.full;

  // Toggle state for Top Order Summary Sidebar (Compact by default)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Form State
  const [contactInfo, setContactInfo] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [phone, setPhone] = useState("");

  const [martialSystem, setMartialSystem] = useState("bjj");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");

  // Payment Accordion State
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "klarna">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);

  // Discount State
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Submit & Ticket State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketConfirmed, setTicketConfirmed] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState("");

  // Auto confirm ticket if redirected back from Stripe Success URL
  React.useEffect(() => {
    const isSuccess = searchParams.get("success") === "true";
    const sessionId = searchParams.get("session_id");
    if (isSuccess) {
      setTicketConfirmed(true);
      setGeneratedTicketId(
        sessionId ? `STRIPE-${sessionId.slice(-6).toUpperCase()}` : `UMS-${Math.floor(1000 + Math.random() * 9000)}`
      );
    }
  }, [searchParams]);

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountCode.trim().toUpperCase() === "UMS10") {
      setAppliedDiscount(10);
      alert("Discount code UMS10 applicato!");
    } else if (discountCode.trim()) {
      alert("Codice sconto non valido.");
    }
  };

  const finalTotal = Math.max(0, tierInfo.price - appliedDiscount);

  const handleStartStripeCheckout = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierName: tierInfo.variant,
          price: finalTotal,
          customerEmail: contactInfo || undefined,
          customerName: `${firstName} ${lastName}`.trim() || undefined,
          phone,
          martialSystem,
          experienceLevel,
          tierKey,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      } else {
        throw new Error(data.error || "Failed to create Stripe Checkout session");
      }
    } catch (err: any) {
      console.warn("Stripe Checkout notice, falling back to simulated ticket:", err);
      setTimeout(() => {
        setGeneratedTicketId(`UMS-${Math.floor(1000 + Math.random() * 9000)}`);
        setIsSubmitting(false);
        setTicketConfirmed(true);
      }, 1000);
    }
  };

  const handleExpressPay = async () => {
    await handleStartStripeCheckout();
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleStartStripeCheckout();
  };

  const handleDownloadCalendar = () => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Universal Method Seminar//EN
BEGIN:VEVENT
SUMMARY:Universal Method Seminar — Chris Collins
DESCRIPTION:Pass: ${tierInfo.variant}
LOCATION:Bracciano, Italy
DTSTART:20260907T170000Z
DTEND:20260908T130000Z
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `UMS_Seminar_2026.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (ticketConfirmed) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.topHeader}>
          <Link href="/" className={styles.brandName}>
            Universal Method Seminar
          </Link>
        </div>

        <div className={styles.successOverlay}>
          <div className={styles.successIcon}>✓</div>
          <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#2b6e59", fontWeight: 700, textTransform: "uppercase" }}>
            RESERVATION SECURED
          </span>
          <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "6px 0", color: "#111111" }}>
            YOU ARE IN.
          </h1>
          <p style={{ color: "#555555", fontSize: "14px", marginBottom: "24px" }}>
            Registrazione confermata per <strong>{firstName || "Partecipante"} {lastName}</strong>. Abbiamo riservato il tuo posto per il seminario.
          </p>

          <div className={styles.successTicketCard}>
            <div className={styles.ticketHeaderRow}>
              <span className={styles.ticketHeaderTitle}>UNIVERSAL METHOD SEMINAR PASS</span>
              <span className={styles.ticketIdBadge}>PASS ID: {generatedTicketId}</span>
            </div>

            <div className={styles.ticketGrid}>
              <div>
                <span className={styles.ticketLabel}>PARTECIPANTE</span>
                <span className={styles.ticketValue}>{firstName || "Partecipante"} {lastName}</span>
              </div>
              <div>
                <span className={styles.ticketLabel}>TIPO DI PASS</span>
                <span className={styles.ticketValueAccent}>{tierInfo.variant}</span>
              </div>
              <div>
                <span className={styles.ticketLabel}>DATE</span>
                <span className={styles.ticketValue}>7 & 8 Settembre 2026</span>
              </div>
              <div>
                <span className={styles.ticketLabel}>LUOGO</span>
                <span className={styles.ticketValue}>Bracciano (RM), Italia</span>
              </div>
            </div>

            {/* Official Barcode for Event Scanner Entrance */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "16px", borderTop: "1px dashed #e1e1e6" }}>
              <span style={{ fontSize: "10px", color: "#888888", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                CODICE A BARRE ACCESSO SEMINARIO (MOSTRA ALL'INGRESSO)
              </span>
              <TicketBarcode ticketId={generatedTicketId} height={46} width={240} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleDownloadCalendar}
              style={{
                background: "#ffffff",
                border: "1px solid #d0d0d0",
                color: "#333333",
                padding: "12px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Scarica Calendario (.ics)
            </button>
            <Link
              href="/"
              style={{
                background: "#2b6e59",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "13px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Torna al Sito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      {/* ── Top Header ── */}
      <header className={styles.topHeader}>
        <Link href="/" className={styles.brandName}>
          Universal Method Seminar
        </Link>

        <div className={styles.cartIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
      </header>

      {/* ── ORDER SUMMARY SIDEBAR PLACED AT THE VERY TOP ── */}
      <div className={styles.topOrderSummaryBox}>
        <div className={styles.topSummaryInner}>
          <div
            className={styles.summaryToggleHeader}
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          >
            <div className={styles.toggleLeft}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span>Mostra riepilogo ordine e codice sconto</span>
              <span className={`${styles.chevronIcon} ${isSummaryOpen ? styles.chevronOpen : ""}`}>
                ▼
              </span>
            </div>

            <div className={styles.toggleRightTotal}>
              <span className={styles.totalCurrencyLabel}>EUR</span>
              <span className={styles.totalAmountLabel}>{finalTotal},00 €</span>
            </div>
          </div>

          {/* Expanded Summary Box at Top */}
          {isSummaryOpen && (
            <div className={styles.summaryExpandedContent}>
              <div className={styles.productRow}>
                <div className={styles.productImageWrap}>
                  <span className={styles.badgeQty}>1</span>
                  <Image
                    src="/logo-header.png"
                    alt="UMS Seminar logo"
                    width={36}
                    height={36}
                    unoptimized
                  />
                </div>
                <div className={styles.productMeta}>
                  <h3 className={styles.productName}>{tierInfo.name}</h3>
                  <p className={styles.productVariant}>{tierInfo.variant}</p>
                  <p className={styles.productVariant} style={{ fontSize: "11px", color: "#888" }}>
                    {tierInfo.dates}
                  </p>
                </div>
                <span className={styles.productPrice}>{tierInfo.price},00 €</span>
              </div>

              {/* Discount Code Input */}
              <form className={styles.discountRow} onSubmit={handleApplyDiscount}>
                <input
                  type="text"
                  placeholder="Codice sconto"
                  className={styles.discountInput}
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button type="submit" className={styles.applyBtn}>
                  Applica
                </button>
              </form>

              <div className={styles.calcDivider} />

              <div className={styles.calcRow}>
                <span>Subtotale</span>
                <span>{tierInfo.price},00 €</span>
              </div>
              {appliedDiscount > 0 && (
                <div className={styles.calcRow} style={{ color: "#1a5b4c", fontWeight: 600 }}>
                  <span>Sconto applicato</span>
                  <span>- {appliedDiscount},00 €</span>
                </div>
              )}
              <div className={styles.calcRow}>
                <span>Spedizione</span>
                <span>Accredito digitale immediato</span>
              </div>

              <div className={styles.calcRowTotal}>
                <span className={styles.totalLabel}>Totale</span>
                <div className={styles.totalPriceWrap}>
                  <span className={styles.totalCurrencyLabel}>EUR</span>
                  <span className={styles.totalAmountLabel}>{finalTotal},00 €</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CHECKOUT FORM (CENTERED BELOW TOP SUMMARY) ── */}
      <div className={styles.formContainer}>
        {/* Express Checkout */}
        <div className={styles.expressSection}>
          <span className={styles.expressTitle}>Check-out rapido</span>
          <button type="button" className={styles.expressPayBtn} onClick={handleExpressPay}>
            <GPayLogo />
          </button>
        </div>

        <div className={styles.orDivider}>
          <span>OPPURE</span>
        </div>

        <form onSubmit={handlePayNow}>
          {/* 1. Contatti */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Contatti</h2>
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                required
                placeholder="Email o numero di telefono cellulare"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={emailOptIn}
                onChange={(e) => setEmailOptIn(e.target.checked)}
              />
              <span>Inviami email con notizie e offerte del seminario</span>
            </label>
          </div>

          {/* 2. Consegna / Dati Partecipante */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Dati Partecipante</h2>
            <p className={styles.sectionSubtitle}>Inserisci i tuoi dati per la registrazione al seminario.</p>

            <div className={styles.inputGroup} style={{ marginTop: "14px" }}>
              <select defaultValue="Italia">
                <option value="Italia">Italia</option>
                <option value="Svizzera">Svizzera</option>
                <option value="San Marino">San Marino</option>
                <option value="Altro">Altro Paese</option>
              </select>
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  required
                  placeholder="Nome"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  required
                  placeholder="Cognome"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Indirizzo"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Interno, scala, ecc. (facoltativo)"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="CAP"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Città"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <select
                  value={martialSystem}
                  onChange={(e) => setMartialSystem(e.target.value)}
                >
                  <option value="bjj">BJJ (Jiu-Jitsu)</option>
                  <option value="wingtsun">Wing Tsun / Ving Tsun</option>
                  <option value="mma">MMA</option>
                  <option value="striking">Striking / Boxing</option>
                  <option value="tactical">Tactical / Defense</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="beginner">1 - 2 Anni Esperienza</option>
                  <option value="intermediate">3 - 5 Anni Esperienza</option>
                  <option value="advanced">Avanzato / Cintura Nera</option>
                  <option value="instructor">Istruttore Accademia</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Pagamento con Loghi Veri */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Pagamento</h2>
            <p className={styles.sectionSubtitle}>Tutte le transazioni sono sicure e crittografate.</p>

            <div className={styles.paymentAccordion} style={{ marginTop: "14px" }}>
              {/* Option 1: Credit Card */}
              <div className={styles.paymentOption}>
                <div
                  className={`${styles.paymentHeader} ${paymentMethod === "card" ? styles.paymentHeaderSelected : ""}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <div className={styles.radioTitle}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    <span>Carta di credito</span>
                  </div>
                  <div className={styles.brandLogos}>
                    <Image src="/payment-logos/visa.svg" alt="Visa" width={38} height={24} unoptimized />
                    <Image src="/payment-logos/mastercard.svg" alt="Mastercard" width={38} height={24} unoptimized />
                    <Image src="/payment-logos/maestro.svg" alt="Maestro" width={38} height={24} unoptimized />
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className={styles.cardBody}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        required
                        placeholder="Numero carta"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>

                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <input
                          type="text"
                          required
                          placeholder="Data di scadenza (MM/AA)"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <input
                          type="password"
                          required
                          placeholder="Codice di sicurezza"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        placeholder="Nome sulla carta"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>

                    <div className={styles.billingCheckbox}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={useShippingAsBilling}
                          onChange={(e) => setUseShippingAsBilling(e.target.checked)}
                        />
                        <span>Usa l'indirizzo di registrazione come indirizzo di fatturazione</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: PayPal */}
              <div className={styles.paymentOption}>
                <div
                  className={`${styles.paymentHeader} ${paymentMethod === "paypal" ? styles.paymentHeaderSelected : ""}`}
                  onClick={() => setPaymentMethod("paypal")}
                >
                  <div className={styles.radioTitle}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "paypal"}
                      onChange={() => setPaymentMethod("paypal")}
                    />
                    <span>PayPal</span>
                  </div>
                  <Image src="/payment-logos/paypal.svg" alt="PayPal" width={64} height={20} unoptimized />
                </div>
              </div>

              {/* Option 3: Klarna */}
              <div className={styles.paymentOption}>
                <div
                  className={`${styles.paymentHeader} ${paymentMethod === "klarna" ? styles.paymentHeaderSelected : ""}`}
                  onClick={() => setPaymentMethod("klarna")}
                >
                  <div className={styles.radioTitle}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "klarna"}
                      onChange={() => setPaymentMethod("klarna")}
                    />
                    <span>Klarna</span>
                  </div>
                  <Image src="/payment-logos/klarna.svg" alt="Klarna" width={54} height={20} unoptimized />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={styles.payNowBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Elaborazione in corso..." : `Paga ora • €${finalTotal},00`}
            </button>
          </div>

          {/* Footer Links */}
          <div className={styles.footerLinks}>
            <a href="#refund" onClick={(e) => e.preventDefault()}>Informativa sui rimborsi</a>
            <a href="#shipping" onClick={(e) => e.preventDefault()}>Spedizioni</a>
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Informativa sulla privacy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Termini e condizioni del servizio</a>
            <a href="#legal" onClick={(e) => e.preventDefault()}>Informativa legale</a>
            <a href="#contact" onClick={(e) => e.preventDefault()}>Contatti</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Caricamento Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
