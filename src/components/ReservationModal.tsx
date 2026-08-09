"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./ReservationModal.module.css";

export type TierType = "full" | "day1" | "day2";

export interface TierInfo {
  id: TierType;
  name: string;
  price: number;
  subtitle: string;
  tag?: string;
  isFeatured?: boolean;
  features: string[];
}

const TIERS: TierInfo[] = [
  {
    id: "day1",
    name: "DAY 1 PASS PERCEIVE",
    price: 80,
    subtitle: "Saturday 7 Sept (17:00 to 20:00)",
    tag: "SINGLE DAY",
    features: [
      "Full access to Saturday session (3 Hours)",
      "Structure, biomechanics and intent reading",
      "Pressure testing and distance control",
    ],
  },
  {
    id: "full",
    name: "FULL SEMINAR (2 DAYS)",
    price: 140,
    subtitle: "Complete 2 day immersion in structure, timing and pressure",
    tag: "RECOMMENDED • SAVE 13%",
    isFeatured: true,
    features: [
      "Access to Day 1 (7 Sept) and Day 2 (8 Sept)",
      "6 Total hours of direct training with Chris Collins",
      "Official UMS Certificate of Completion",
      "Exclusive post seminar video breakdown access",
    ],
  },
  {
    id: "day2",
    name: "DAY 2 PASS ADAPT",
    price: 80,
    subtitle: "Sunday 8 Sept (10:00 to 13:00)",
    tag: "SINGLE DAY",
    features: [
      "Full access to Sunday session (3 Hours)",
      "Live timing, angles and application mechanics",
      "Fluid response across martial systems",
    ],
  },
];

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  initialSessionId?: string;
}

export default function ReservationModal({
  isOpen,
  onClose,
  initialStep = 1,
  initialSessionId = "",
}: ReservationModalProps) {
  const [step, setStep] = useState<number>(initialStep);
  const [selectedTier, setSelectedTier] = useState<TierType>("full");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketId, setTicketId] = useState(initialSessionId);

  // Double Confirmation Modal State
  const [showDoubleConfirm, setShowDoubleConfirm] = useState(false);
  const [duplicateData, setDuplicateData] = useState<{
    existingName?: string;
    existingTicketId?: string;
    existingTier?: string;
  }>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    system: "bjj",
    experience: "intermediate",
  });

  useEffect(() => {
    if (initialStep) setStep(initialStep);
    if (initialSessionId) setTicketId(initialSessionId);
  }, [initialStep, initialSessionId]);

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (lenis && typeof lenis.stop === "function") lenis.stop();
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (lenis && typeof lenis.start === "function") lenis.start();
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (lenis && typeof lenis.start === "function") lenis.start();
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const currentTierObj = TIERS.find((t) => t.id === selectedTier) || TIERS[0];

  const handleNextToTier = () => setStep(2);
  const handleNextToInfo = () => setStep(3);
  const handleBack = () => {
    if (showDoubleConfirm) {
      setShowDoubleConfirm(false);
      return;
    }
    if (step > 1 && step < 4) setStep((prev) => prev - 1);
  };

  const executeStripeRedirect = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierName: currentTierObj.name,
          price: currentTierObj.price,
          customerEmail: formData.email,
          customerName: formData.name,
          phone: formData.phone,
          martialSystem: formData.system,
          experienceLevel: formData.experience,
          tierKey: currentTierObj.id,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Stripe Checkout error");
      }
    } catch (err: any) {
      console.error("Stripe Checkout Error:", err);
      alert("Errore nella connessione a Stripe: " + (err.message || "Riprova più tardi."));
      setIsProcessing(false);
    }
  };

  const handleProceedToStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!formData.name || !formData.email) {
      alert("Inserisci Nome ed Email del partecipante.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Check duplicate registration
      const checkRes = await fetch(
        `/api/check-existing-booking?email=${encodeURIComponent(formData.email)}`
      );
      const checkData = await checkRes.json();

      if (checkData.alreadyPaid) {
        setIsProcessing(false);
        setDuplicateData({
          existingName: checkData.existingName,
          existingTicketId: checkData.existingTicketId,
          existingTier: checkData.existingTier,
        });
        setShowDoubleConfirm(true);
        return;
      }

      // 2. Direct single-click Stripe Checkout trigger
      await executeStripeRedirect();
    } catch (err: any) {
      console.error("Check duplicate error:", err);
      await executeStripeRedirect();
    }
  };

  const handleDownloadTicket = () => {
    const attendeeName = formData.name || "Partecipante Confermato";
    const passName = currentTierObj.name;
    const currentTicketId = ticketId || "UMS-2026";

    const ticketHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Biglietto di Ingresso — ${currentTicketId}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #070707; color: #f5f2ea; padding: 40px; margin: 0; }
    .ticket { max-width: 600px; margin: 0 auto; border: 2px solid #e1a10b; border-radius: 12px; padding: 32px; background: #0d0d0d; box-shadow: 0 20px 60px rgba(0,0,0,0.8); }
    .header { font-size: 16px; font-weight: bold; color: #e1a10b; text-align: center; border-bottom: 1px dashed #333; padding-bottom: 16px; letter-spacing: 2px; }
    .title { font-size: 26px; font-weight: bold; text-align: center; margin: 20px 0 6px 0; color: #ffffff; }
    .ticket-id { text-align: center; font-family: monospace; color: #e1a10b; font-size: 15px; font-weight: bold; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; background: #141414; padding: 20px; border-radius: 8px; border: 1px solid #222; }
    .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1.5px; }
    .val { font-size: 14px; font-weight: bold; color: #fff; margin-top: 4px; }
    .val-gold { font-size: 14px; font-weight: bold; color: #e1a10b; margin-top: 4px; }
    .footer { text-align: center; font-size: 12px; color: #888; border-top: 1px solid #222; padding-top: 16px; margin-top: 24px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">UNIVERSAL METHOD SEMINAR • CHRIS COLLINS</div>
    <div class="title">BIGLIETTO DI INGRESSO UFFICIALE</div>
    <div class="ticket-id">PASS ID: ${currentTicketId}</div>

    <div class="grid">
      <div>
        <div class="label">PARTECIPANTE</div>
        <div class="val">${attendeeName}</div>
      </div>
      <div>
        <div class="label">TIPO DI PASS</div>
        <div class="val-gold">${passName}</div>
      </div>
      <div>
        <div class="label">DATE & ORARI</div>
        <div class="val">7 & 8 Settembre 2026</div>
      </div>
      <div>
        <div class="label">LUOGO</div>
        <div class="val">Bracciano (RM), Italia</div>
      </div>
    </div>

    <div class="footer">
      <strong>Istruttore: Chris Collins</strong> (BJJ Black Belt & Wing Tsun Sifu)<br/>
      Presenta questo biglietto di ingresso all'arrivo per accedere al seminario.
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(ticketHtml);
      printWindow.document.close();
    } else {
      const blob = new Blob([ticketHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `UMS_Biglietto_Ingresso_${currentTicketId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadCalendar = () => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Universal Method Seminar//EN
BEGIN:VEVENT
SUMMARY:Universal Method Seminar Chris Collins
DESCRIPTION:Pass: ${currentTierObj.name}
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

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        {/* Top Navigation Header */}
        <div className={styles.header}>
          <div className={styles.brandGroup}>
            <span className={styles.brandTitle}>UNIVERSAL METHOD</span>
            <span className={styles.brandSub}>SEMINAR</span>
          </div>

          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Minimal Editorial Progress Tracker */}
        <div className={styles.progressRow}>
          <span className={`${styles.progressStep} ${step === 1 ? styles.activeStep : ""}`}>
            01 OVERVIEW
          </span>
          <span className={`${styles.progressStep} ${step === 2 ? styles.activeStep : ""}`}>
            02 SELECT PASS
          </span>
          <span className={`${styles.progressStep} ${step === 3 ? styles.activeStep : ""}`}>
            03 PROFILE & STRIPE
          </span>
          <span className={`${styles.progressStep} ${step === 4 ? styles.activeStep : ""}`}>
            04 CONFIRMATION
          </span>
        </div>

        {/* ── STEP 1: OVERVIEW & CREDENTIALS ── */}
        {step === 1 && (
          <div className={styles.stepBody}>
            {/* Header Hero */}
            <div className={styles.overviewHero}>
              <span className={styles.overviewEyebrow}>CHRIS COLLINS MASTERCLASS</span>
              <h2 className={styles.overviewTitle}>UNIVERSAL METHOD SEMINAR</h2>
              <p className={styles.overviewSub}>7 & 8 SEPTEMBER 2026 • BRACCIANO (ROME), ITALY</p>
            </div>

            {/* 4 Stats Grid */}
            <div className={styles.overviewStatsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statNum}>30</span>
                <span className={styles.statLabel}>MAX PRACTITIONERS</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>2 DAYS</span>
                <span className={styles.statLabel}>IMMERSION</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>6 HRS</span>
                <span className={styles.statLabel}>DIRECT INSTRUCTION</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>DIPLOMA</span>
                <span className={styles.statLabel}>CERTIFICATION</span>
              </div>
            </div>

            {/* Instructor & Immersion Details */}
            <div className={styles.overviewDetailsCard}>
              <div className={styles.detailRow}>
                <span className={styles.dLabel}>HEAD INSTRUCTOR</span>
                <span className={styles.dValue}>Chris Collins (BJJ Black Belt & Wing Tsun Sifu)</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.dLabel}>VENUE & LOCATION</span>
                <span className={styles.dValue}>Private Training Grounds • Bracciano, Italy</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.dLabel}>SEMINAR FOCUS</span>
                <span className={styles.dValue}>Biomechanics, Timing, Pressure & Structure</span>
              </div>
            </div>

            {/* Bottom Action */}
            <div className={styles.overviewActionBox}>
              <button className={styles.btnPrimaryFull} onClick={handleNextToTier}>
                SELECT YOUR SEMINAR PASS →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: TIER SELECTION ── */}
        {step === 2 && (
          <div className={styles.stepBody}>
            <div className={styles.stepHeader}>
              <p className={styles.eyebrow}>STEP 02 OF 03</p>
              <h2 className={styles.stepTitle}>SELECT YOUR SEMINAR TIER</h2>
            </div>

            <div className={styles.tiersGrid}>
              {TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                const isFeatured = tier.isFeatured;
                return (
                  <div
                    key={tier.id}
                    className={`${styles.tierCard} ${
                      isFeatured ? styles.tierFeatured : styles.tierSingleDay
                    } ${isSelected ? styles.tierSelected : styles.tierUnselected}`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    {tier.tag && <span className={styles.tierTag}>{tier.tag}</span>}
                    <div className={styles.tierHeader}>
                      <h3 className={styles.tierName}>{tier.name}</h3>
                      <div className={styles.tierPrice}>€{tier.price}</div>
                    </div>
                    <p className={styles.tierSubtitle}>{tier.subtitle}</p>

                    <div className={styles.tierDivider} />

                    <ul className={styles.featuresList}>
                      {tier.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>

                    <div className={styles.selectStatus}>
                      {isSelected ? "[ SELECTED PASS ]" : "CLICK TO SELECT"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.actionRowBetween}>
              <button className={styles.btnSecondary} onClick={handleBack}>
                BACK
              </button>
              <button className={styles.btnPrimary} onClick={handleNextToInfo}>
                CONTINUE TO PROFILE (€{currentTierObj.price})
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: PRACTITIONER PROFILE / DOUBLE CONFIRM ── */}
        {step === 3 && (
          <>
            {showDoubleConfirm ? (
              /* Inline Custom Double Confirmation Modal View */
              <div className={styles.stepBody}>
                <div className={styles.warningCard}>
                  <div className={styles.warningIcon}>⚠️</div>
                  <h3 className={styles.warningTitle}>PARTECIPANTE GIÀ REGISTRATO</h3>
                  <p className={styles.warningText}>
                    Risulta già un’iscrizione confermata per <strong>{formData.email}</strong>
                    {duplicateData.existingName ? ` (${duplicateData.existingName})` : ""} con Pass ID:{" "}
                    <strong>{duplicateData.existingTicketId || "UMS-PASS"}</strong>.
                    <br />
                    Sei sicuro di voler procedere all'acquisto di un <strong>ulteriore pass</strong> per questo partecipante?
                  </p>

                  <div className={styles.actionRowCenter}>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => setShowDoubleConfirm(false)}
                    >
                      ANNULLA / CAMBIA DATI
                    </button>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={executeStripeRedirect}
                      disabled={isProcessing}
                    >
                      {isProcessing
                        ? "APERTURA CASSA STRIPE..."
                        : `CONFERMA E PAGA SU STRIPE (€${currentTierObj.price})`}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Practitioner Form */
              <form className={styles.stepBody} onSubmit={handleProceedToStripeCheckout}>
                <div className={styles.stepHeader}>
                  <p className={styles.eyebrow}>STEP 03 OF 03 • PARTICIPANT REGISTRATION</p>
                  <h2 className={styles.stepTitle}>PRACTITIONER PROFILE</h2>
                </div>

                <div className={styles.profileFormBox}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="name">FULL NAME *</label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Marco Rossi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="email">EMAIL ADDRESS *</label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="marco@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="phone">WHATSAPP OR PHONE *</label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="+39 340 1234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="system">PRIMARY MARTIAL SYSTEM</label>
                      <select
                        id="system"
                        value={formData.system}
                        onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                      >
                        <option value="bjj">BJJ (Brazilian Jiu Jitsu)</option>
                        <option value="wingtsun">Wing Tsun, Ving Tsun</option>
                        <option value="mma">Mixed Martial Arts (MMA)</option>
                        <option value="striking">Muay Thai, Boxing</option>
                        <option value="tactical">Tactical, Krav Maga</option>
                        <option value="other">Other System</option>
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="experience">EXPERIENCE LEVEL</label>
                      <select
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      >
                        <option value="beginner">1 to 2 Years</option>
                        <option value="intermediate">3 to 5 Years</option>
                        <option value="advanced">Advanced, Black Belt</option>
                        <option value="instructor">Academy Instructor</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.actionRowBetween}>
                  <button type="button" className={styles.btnSecondary} onClick={handleBack}>
                    BACK
                  </button>
                  <button
                    type="submit"
                    className={`${styles.btnPrimary} ${isProcessing ? styles.btnLoading : ""}`}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "OPENING STRIPE CHECKOUT..."
                      : `PROCEED TO PAY VIA STRIPE (€${currentTierObj.price})`}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ── STEP 4: CONFIRMATION (Return from Stripe) ── */}
        {step === 4 && (
          <div className={styles.stepBody}>
            <div className={styles.confirmHeader}>
              <p className={styles.eyebrow}>RESERVATION CONFIRMED</p>
              <h2 className={styles.confirmTitle}>YOU ARE IN</h2>
              <p className={styles.confirmSub}>
                Your spot has been secured for the Universal Method Seminar cohort in Bracciano.
              </p>
            </div>

            {/* Editorial Ticket Pass */}
            <div className={styles.ticketPass}>
              <div className={styles.ticketHeader}>
                <span>UNIVERSAL METHOD SEMINAR</span>
                <span className={styles.ticketId}>PASS ID: {ticketId || "UMS-2026"}</span>
              </div>

              <div className={styles.ticketGrid}>
                <div>
                  <span className={styles.tLabel}>ATTENDEE</span>
                  <span className={styles.tVal}>{formData.name || "Partecipante Confermato"}</span>
                </div>
                <div>
                  <span className={styles.tLabel}>PASS TYPE</span>
                  <span className={styles.tValGold}>{currentTierObj.name}</span>
                </div>
                <div>
                  <span className={styles.tLabel}>DATES</span>
                  <span className={styles.tVal}>7 and 8 Sept 2026</span>
                </div>
                <div>
                  <span className={styles.tLabel}>LOCATION</span>
                  <span className={styles.tVal}>Bracciano, Italy</span>
                </div>
              </div>

              <div className={styles.ticketFooter}>
                <span>INSTRUCTOR: CHRIS COLLINS</span>
                <span>STATUS: SECURED AND VERIFIED</span>
              </div>
            </div>

            <div className={styles.actionRowCenter} style={{ flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "#8E8880", textAlign: "center", margin: "0 0 6px 0" }}>
                ✉️ Abbiamo inviato una copia del biglietto e la conferma d’iscrizione alla tua email.
              </p>
              <button
                className={styles.btnPrimary}
                style={{ width: "100%", padding: "16px 20px" }}
                onClick={handleDownloadTicket}
              >
                SCARICA BIGLIETTO DI INGRESSO
              </button>
              <button
                className={styles.btnSecondary}
                style={{ width: "100%", marginTop: "4px" }}
                onClick={onClose}
              >
                CHIUDI FINESTRA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
