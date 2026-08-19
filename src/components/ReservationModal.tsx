"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./ReservationModal.module.css";
import { encodeCode128B } from "./TicketBarcode";
import QRCode from "qrcode";
import { useLanguage } from "@/context/LanguageContext";

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

function getTiers(lang: string): TierInfo[] {
  const isEn = lang === "en";
  return [
    {
      id: "full",
      name: isEn ? "FULL SEMINAR (2 DAYS)" : "SEMINARIO COMPLETO (2 GIORNI)",
      price: 140,
      subtitle: isEn ? "Saturday 7 & Sunday 8 September 2026 (6 Hours Total)" : "Sabato 7 e Domenica 8 Settembre 2026 (6 Ore Totali)",
      tag: isEn ? "RECOMMENDED" : "CONSIGLIATO",
      isFeatured: true,
      features: isEn
        ? [
            "Full access to both days (7 & 8 September)",
            "6 Hours of direct instruction with Chris Collins",
            "Official UMS Certificate of Participation",
            "Exclusive access to post-seminar video breakdown",
          ]
        : [
            "Accesso completo a entrambe le giornate (7 e 8 Settembre)",
            "6 Ore di istruzione diretta con Chris Collins",
            "Attestato di Partecipazione Ufficiale UMS",
            "Accesso esclusivo ai video di analisi post-seminario",
          ],
    },
    {
      id: "day1",
      name: isEn ? "Day 1 Pass — Perceive" : "Pass Giorno 1 — Percepire",
      price: 80,
      subtitle: isEn ? "Saturday 7 September (17:00 - 20:00)" : "Sabato 7 Settembre (17:00 - 20:00)",
      tag: isEn ? "SINGLE DAY" : "SINGOLA GIORNATA",
      features: isEn
        ? [
            "Full access to Saturday session (3 Hours)",
            "Structure, biomechanics and intention reading",
            "Pressure testing and distance control",
          ]
        : [
            "Accesso completo alla sessione di Sabato (3 Ore)",
            "Struttura, biomeccanica e lettura dell'intenzione",
            "Test di pressione e controllo della distanza",
          ],
    },
    {
      id: "day2",
      name: isEn ? "Day 2 Pass — Adapt" : "Pass Giorno 2 — Adattarsi",
      price: 80,
      subtitle: isEn ? "Sunday 8 September (10:00 - 13:00)" : "Domenica 8 Settembre (10:00 - 13:00)",
      tag: isEn ? "SINGLE DAY" : "SINGOLA GIORNATA",
      features: isEn
        ? [
            "Full access to Sunday session (3 Hours)",
            "Dynamic timing, angles and application mechanics",
            "Fluid response across martial systems",
          ]
        : [
            "Accesso completo alla sessione di Domenica (3 Ore)",
            "Timing dinamico, angoli e meccaniche applicative",
            "Risposta fluida tra diversi sistemi marziali",
          ],
    },
  ];
}


interface CustomSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}

function CustomSelect({ label, value, options, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className={styles.customSelectContainer}>
      {label && <label>{label}</label>}
      <div
        className={`${styles.customSelectTrigger} ${isOpen ? styles.customSelectOpen : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.customSelectLabel}>{selectedOption.label}</span>
        <svg
          className={`${styles.selectChevron} ${isOpen ? styles.chevronRotated : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <>
          <div className={styles.customSelectBackdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.customDropdownMenu}>
            {options.map((opt) => {
              const isSel = opt.value === value;
              return (
                <div
                  key={opt.value}
                  className={`${styles.customDropdownItem} ${isSel ? styles.customDropdownItemActive : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {isSel && <span className={styles.checkmarkIcon}>✓</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

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
  const { lang, dict } = useLanguage();
  const tiers = getTiers(lang);

  const [step, setStep] = useState<number>(initialStep);
  const [selectedTier, setSelectedTier] = useState<TierType>("full");

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "klarna">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketId, setTicketId] = useState(initialSessionId);

  // Active Tab Ref for Mobile Header Auto-Scroll
  const activeTabRef = useRef<HTMLSpanElement>(null);

  // Terms and Support Overlay States
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Double Confirmation Modal State
  const [showDoubleConfirm, setShowDoubleConfirm] = useState(false);
  const [duplicateData, setDuplicateData] = useState<{
    existingName?: string;
    existingTicketId?: string;
    existingTier?: string;
  }>({});
  const [countryCode, setCountryCode] = useState("+39");

  // Step 3 Sub-steps & SMS Verification State
  const [contactSubStep, setContactSubStep] = useState<1 | 2 | 3>(1);
  const [smsCode, setSmsCode] = useState("");
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsNotice, setSmsNotice] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    system: "bjj",
    experience: "intermediate",
  });

  // Auto-scroll header active tab into center view on step change
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [step]);

  useEffect(() => {
    if (initialStep) setStep(initialStep);
    if (initialSessionId) setTicketId(initialSessionId);
  }, [initialStep, initialSessionId]);

  // 1-Second Skeleton Loading State on Modal Open
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);

  useEffect(() => {
    if (isOpen && initialStep !== 5) {
      setIsLoadingSkeleton(true);
      const timer = setTimeout(() => {
        setIsLoadingSkeleton(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsLoadingSkeleton(false);
    }
  }, [isOpen, initialStep]);

  // Restore attendee data from localStorage/sessionStorage when returning from Stripe
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("ums_name") || sessionStorage.getItem("ums_name");
      const savedEmail = localStorage.getItem("ums_email") || sessionStorage.getItem("ums_email");
      const savedPhone = localStorage.getItem("ums_phone") || sessionStorage.getItem("ums_phone");
      const savedSystem = localStorage.getItem("ums_system") || sessionStorage.getItem("ums_system");
      const savedExp = localStorage.getItem("ums_experience") || sessionStorage.getItem("ums_experience");

      if (savedName || savedEmail) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || savedName || "",
          email: prev.email || savedEmail || "",
          phone: prev.phone || savedPhone || "",
          system: savedSystem || prev.system,
          experience: savedExp || prev.experience,
        }));
      }
    }
  }, [isOpen, initialStep, initialSessionId]);

  const openTerms = () => {
    window.history.pushState({ modalType: "terms" }, "");
    setShowTermsModal(true);
  };

  const openSupport = () => {
    window.history.pushState({ modalType: "support" }, "");
    setShowSupportModal(true);
  };

  const closeTerms = () => {
    setShowTermsModal(false);
  };

  const closeSupport = () => {
    setShowSupportModal(false);
  };

  // Mobile Hardware Back Button (Popstate) Stack Protection
  useEffect(() => {
    if (!isOpen) return;

    // Push initial history state when modal opens
    window.history.pushState({ modalType: "reservation" }, "");

    const handlePopState = () => {
      if (showTermsModal) {
        setShowTermsModal(false);
        return;
      }
      if (showSupportModal) {
        setShowSupportModal(false);
        return;
      }
      onClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, showTermsModal, showSupportModal, onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (showTermsModal) {
          setShowTermsModal(false);
          return;
        }
        if (showSupportModal) {
          setShowSupportModal(false);
          return;
        }
        onClose();
      }
    },
    [isOpen, showTermsModal, showSupportModal, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const currentTierObj = tiers.find((t) => t.id === selectedTier) || tiers[0];

  const handleNextToTier = () => setStep(2);
  const handleNextToDati = () => setStep(3);
  const handleNextToEsperienza = () => {
    if (!formData.name.trim()) {
      alert("Inserisci il tuo Nome e Cognome.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      alert("Inserisci un indirizzo Email valido.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      alert("Inserisci un numero di cellulare valido.");
      return;
    }
    setStep(4);
  };

  const handleBack = () => {
    if (showDoubleConfirm) {
      setShowDoubleConfirm(false);
      return;
    }
    if (step > 1 && step < 5) setStep((prev) => prev - 1);
  };

  const handleSendSmsCode = () => {
    if (!formData.phone || formData.phone.trim().length < 6) {
      alert("Inserisci un numero di cellulare valido prima di inviare il codice SMS.");
      return;
    }
    setSmsLoading(true);
    setTimeout(() => {
      setSmsLoading(false);
      setIsSmsSent(true);
      setSmsNotice(`Codice di verifica inviato via SMS a ${countryCode} ${formData.phone}`);
    }, 600);
  };

  const handleVerifySmsCode = (code: string) => {
    setSmsCode(code);
    if (code.trim().length >= 4) {
      setIsPhoneVerified(true);
    } else {
      setIsPhoneVerified(false);
    }
  };

  const handleNextContactSubStep1 = () => {
    if (!formData.name.trim()) {
      alert("Inserisci il tuo Nome e Cognome per proseguire.");
      return;
    }
    setContactSubStep(2);
  };

  const handleNextContactSubStep2 = () => {
    if (!formData.email.trim() || !formData.email.includes("@")) {
      alert("Inserisci un indirizzo Email valido.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      alert("Inserisci un numero di cellulare valido per proseguire.");
      return;
    }
    if (!isPhoneVerified) {
      // Auto trigger SMS verify simulation if user didn't click manual button
      setIsPhoneVerified(true);
    }
    setContactSubStep(3);
  };

  const executeStripeRedirect = async () => {
    setIsProcessing(true);
    const fullPhone = formData.phone
      ? formData.phone.startsWith("+")
        ? formData.phone
        : `${countryCode} ${formData.phone}`
      : "";

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("ums_name", formData.name);
        sessionStorage.setItem("ums_email", formData.email);
        sessionStorage.setItem("ums_phone", fullPhone);
        sessionStorage.setItem("ums_system", formData.system);
        sessionStorage.setItem("ums_experience", formData.experience);

        localStorage.setItem("ums_name", formData.name);
        localStorage.setItem("ums_email", formData.email);
        localStorage.setItem("ums_phone", fullPhone);
        localStorage.setItem("ums_system", formData.system);
        localStorage.setItem("ums_experience", formData.experience);
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierName: currentTierObj.name,
          price: currentTierObj.price,
          customerEmail: formData.email,
          customerName: formData.name,
          phone: fullPhone,
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

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactSubStep === 1) {
      handleNextContactSubStep1();
      return;
    }
    if (contactSubStep === 2) {
      handleNextContactSubStep2();
      return;
    }
    if (contactSubStep === 3) {
      handleProceedToStripeCheckout(e);
      return;
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

  const handleDownloadTicket = async () => {
    const attendeeName = formData.name || "Partecipante Confermato";
    const passName = currentTierObj.name;
    const currentTicketId = ticketId || "UMS-2026-00147";
    const systemLabel =
      formData.system === "bjj"
        ? "BJJ (Jiu-Jitsu)"
        : formData.system === "wing-tsun"
        ? "Wing Tsun"
        : formData.system === "mma"
        ? "MMA / Striking"
        : formData.system === "karate"
        ? "Karate / Kung Fu"
        : "Arti Marziali";
    const expLabel =
      formData.experience === "beginner"
        ? "Principiante"
        : formData.experience === "advanced"
        ? "Avanzato / Cintura Nera"
        : "Intermedio";

    // Load html2pdf library dynamically if needed
    if (typeof window !== "undefined" && !(window as any).html2pdf) {
      await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    }

    let qrDataUrl = "";
    try {
      qrDataUrl = await QRCode.toDataURL(currentTicketId, { margin: 1, width: 140 });
    } catch (e) {
      console.warn("Could not generate QR code data URL:", e);
    }

    const ticketSheetHtml = `
      <div id="pdf-ticket-container" style="width: 780px; background: #fdfcf9; font-family: 'Work Sans', sans-serif; color: #1c1a17; padding: 34px 40px 26px; box-sizing: border-box;">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Work+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
          #pdf-ticket-container * { box-sizing: border-box; }
          .topbar { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 2px solid #1c1a17; }
          .brand { display: flex; align-items: center; gap: 12px; }
          .brand .mark { width: 38px; height: 38px; border: 2px solid #0074d4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 13px; color: #0074d4; }
          .brand .name { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 18px; letter-spacing: .02em; }
          .brand .name small { display: block; font-family: 'Work Sans', sans-serif; font-weight: 400; font-size: 10px; letter-spacing: .18em; color: #6b6459; text-transform: uppercase; }
          .stampa-tag { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: .03em; background: #1c1a17; color: #fdfcf9; padding: 8px 14px; border-radius: 3px; display: flex; align-items: center; gap: 8px; }
          .muster { display: inline-block; margin: 14px 0 2px; font-family: 'Oswald', sans-serif; font-size: 11px; letter-spacing: .25em; color: #8a6a3a; border: 1px solid #8a6a3a; padding: 2px 8px; border-radius: 2px; }
          .order-title { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: #6b6459; margin: 16px 0 6px; }
          .order-box { margin-top: 10px; border: 1px solid #d8d2c4; background: #f4f1e9; padding: 14px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 24px; border-radius: 4px; }
          .order-box .item .label { font-size: 9.5px; letter-spacing: .12em; text-transform: uppercase; color: #6b6459; }
          .order-box .item .value { font-size: 13px; font-weight: 500; margin-top: 2px; }
          .ticket { margin-top: 18px; border: 1.5px solid #1c1a17; border-radius: 6px; overflow: hidden; }
          .ticket-head { background: #1c1a17; color: #fdfcf9; padding: 10px 18px; display: flex; align-items: center; justify-content: space-between; }
          .ticket-head .t1 { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: .04em; }
          .ticket-head .t2 { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #d8d2c4; }
          .ticket-body { display: flex; }
          .ticket-main { flex: 1; padding: 18px 20px 16px; }
          .participant { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 19px; letter-spacing: .01em; }
          .event-title { margin-top: 4px; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 22px; text-transform: uppercase; color: #0074d4; }
          .event-sub { margin-top: 4px; font-size: 12px; color: #6b6459; }
          .notice { margin-top: 10px; font-size: 11px; background: #e0f2fe; border-left: 3px solid #0074d4; padding: 6px 10px; color: #0369a1; font-weight: 500; }
          .info-grid { margin-top: 14px; display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px dashed #d8d2c4; }
          .info-grid .cell { padding: 10px 12px 0; border-right: 1px dashed #d8d2c4; }
          .info-grid .cell:last-child { border-right: none; }
          .info-grid .label { font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: #6b6459; }
          .info-grid .value { font-size: 13px; font-weight: 600; margin-top: 3px; }
          .info-grid .value small { display: block; font-weight: 400; font-size: 10.5px; color: #6b6459; }
          .price-row { margin-top: 14px; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #d8d2c4; padding-top: 10px; }
          .price-row .qty { font-size: 11px; color: #6b6459; }
          .price-row .price { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 20px; }
          .ticket-side { flex: 0 0 140px; border-left: 1.5px dashed #1c1a17; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; text-align: center; background: #faf8f3; }
          .side-code { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: .05em; color: #0074d4; }
          .side-tag { font-family: 'Oswald', sans-serif; font-size: 11px; text-transform: uppercase; margin-top: 6px; color: #6b6459; }
          .section-title { margin-top: 26px; font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: .06em; text-transform: uppercase; color: #1c1a17; border-bottom: 1px solid #d8d2c4; padding-bottom: 6px; }
          .rules { margin-top: 10px; font-size: 11.5px; line-height: 1.7; color: #3a352e; }
          .rules p { margin-bottom: 6px; }
          .steps { margin-top: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .step { display: flex; gap: 10px; }
          .step .num { flex: 0 0 26px; height: 26px; border-radius: 50%; background: #0074d4; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 12px; }
          .step .txt { font-size: 11px; line-height: 1.45; }
          .step .txt b { display: block; font-size: 11.5px; margin-bottom: 2px; }
          .footer { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; border-top: 2px solid #1c1a17; padding-top: 12px; }
          .footer .price-big { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 16px; }
          .footer .page { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6b6459; }
        </style>

        <div class="topbar">
          <div class="brand">
            <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/logo.png" alt="UMS Logo" style="height: 44px; width: auto; object-fit: contain;" />
            <div class="name">Universal Method Seminar<small>Sistema di Arti Marziali — Chris Collins</small></div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/yim-logo-ticket.png" alt="YIM Logo" style="height: 54px; width: auto; object-fit: contain;" />
            <div class="stampa-tag">STAMPA @ CASA</div>
          </div>
        </div>

        <div class="muster">COPIA CLIENTE</div>

        <div class="order-title">Dati ordine</div>
        <div class="order-box">
          <div class="item"><div class="label">Nome cognome</div><div class="value">${attendeeName}</div></div>
          <div class="item"><div class="label">Codice riferimento</div><div class="value">${currentTicketId}</div></div>
          <div class="item"><div class="label">Data ordine</div><div class="value">${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</div></div>
          <div class="item"><div class="label">Modalità pagamento</div><div class="value">Carta di credito (Stripe)</div></div>
          <div class="item"><div class="label">Tipo Pass</div><div class="value">${passName}</div></div>
          <div class="item"><div class="label">Email</div><div class="value">${formData.email || '—'}</div></div>
        </div>

        <div class="ticket">
          <div class="ticket-head">
            <div class="t1">2026 Universal Method Seminar</div>
            <div class="t2">Obbligo di check-in all'ingresso</div>
          </div>
          <div class="ticket-body">
            <div class="ticket-main">
              <div class="participant">${attendeeName}</div>
              <div class="event-title">${passName}</div>
              <div class="event-sub">Bracciano (RM), Italia · 7–8 settembre 2026</div>

              <div class="notice">Check-in richiesto — Istruttore principale: Chris Collins (BJJ Black Belt and Wing Tsun Sifu)</div>

              <div class="info-grid">
                <div class="cell"><div class="label">Date</div><div class="value">7 & 8 Sept 2026<small>Orari su pass</small></div></div>
                <div class="cell"><div class="label">Livello</div><div class="value">${expLabel}<small>Tutte le età</small></div></div>
                <div class="cell"><div class="label">Sistema</div><div class="value">${systemLabel}<small>UMS Method</small></div></div>
                <div class="cell"><div class="label">Luogo</div><div class="value">Bracciano<small>Roma, Italia</small></div></div>
              </div>

              <div class="price-row">
                <div class="qty">1 Biglietto · Ingresso Ufficiale UMS</div>
                <div class="price">${currentTierObj.price},00 €</div>
              </div>
            </div>

            <div class="ticket-side" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px 10px;text-align:center;">
              <div style="font-size:8.5px;color:#6b6459;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">QR CODE PASS</div>
              ${qrDataUrl ? `<img src="${qrDataUrl}" width="80" height="80" style="background:#ffffff;padding:3px;border-radius:4px;border:1px solid #d8d2c4;" />` : ""}
              <div class="side-code" style="font-family:monospace;font-weight:bold;color:#0074d4;font-size:11px;letter-spacing:0.05em;white-space:nowrap;">${currentTicketId}</div>
              <div class="side-tag" style="font-size:9.5px;color:#6b6459;text-transform:uppercase;font-weight:600;white-space:nowrap;">Pass Ufficiale</div>
            </div>
          </div>
        </div>

        <div class="section-title">Istruzioni per l'accesso</div>
        <div class="rules">
          <p>Affinché l'ingresso si svolga senza alcun intoppo, ti preghiamo di osservare le seguenti indicazioni:</p>
          <p>Il biglietto può essere stampato su foglio A4 oppure mostrato direttamente dallo smartphone.</p>
          <p>Tieni il biglietto con te il giorno del seminario insieme a un documento d'identità valido.</p>
          <p>Presentati al check-in almeno 15 minuti prima dell'inizio delle attività.</p>
        </div>

        <div class="section-title">Come presentare il biglietto</div>
        <div class="steps">
          <div class="step">
            <div class="num">1</div>
            <div class="txt"><b>Prendi il biglietto</b>Stampa questa pagina oppure tienila pronta sullo smartphone.</div>
          </div>
          <div class="step">
            <div class="num">2</div>
            <div class="txt"><b>Presentati al check-in</b>Mostra questo documento al personale all'ingresso della struttura.</div>
          </div>
          <div class="step">
            <div class="num">3</div>
            <div class="txt"><b>Entra sul tatami</b>Raggiungi l'area di allenamento ed attendi l'inizio del seminario.</div>
          </div>
        </div>

        <div class="footer">
          <div><strong>Universal Method Seminar</strong> — Chris Collins</div>
          <div class="price-big">${currentTierObj.price},00 € EUR</div>
          <div class="page">1 / 1</div>
        </div>
      </div>
    `;

    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      const element = document.createElement("div");
      element.style.position = "fixed";
      element.style.left = "-9999px";
      element.style.top = "-9999px";
      element.innerHTML = ticketSheetHtml;
      document.body.appendChild(element);

      const opt = {
        margin: [4, 4, 4, 4],
        filename: `UMS_Biglietto_${currentTicketId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      try {
        const pdfBase64 = await html2pdf().set(opt).from(element.firstElementChild).outputPdf("base64");
        const pdfBlobUrl = await html2pdf().set(opt).from(element.firstElementChild).toPdf().output("bloburl");

        if (formData.email && pdfBase64) {
          fetch("/api/send-ticket-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              toEmail: formData.email,
              toName: attendeeName,
              ticketId: currentTicketId,
              tierName: passName,
              pdfBase64,
            }),
          }).catch((err) => console.warn("Notice: Send ticket email with PDF attached:", err));
        }

        if (pdfBlobUrl) {
          window.open(pdfBlobUrl, "_blank");
        } else {
          await html2pdf().set(opt).from(element.firstElementChild).save();
        }
      } catch (err) {
        console.warn("html2pdf error, fallback to print:", err);
        fallbackPrintWindow(ticketSheetHtml, currentTicketId);
      } finally {
        document.body.removeChild(element);
      }
    } else {
      fallbackPrintWindow(ticketSheetHtml, currentTicketId);
    }
  };

  const fallbackPrintWindow = (htmlContent: string, currentTicketId: string) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Biglietto — ${currentTicketId}</title></head><body style="margin:0;padding:20px;background:#e9e5da;">${htmlContent}<script>window.onload=function(){window.print();}</script></body></html>`);
      printWindow.document.close();
    }
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
        {/* Clean Minimal Header Bar with Progress Indicator */}
        <div className={styles.header}>
          <div className={styles.minimalProgressSteps}>
            <span className={step >= 1 ? styles.stepDotActive : styles.stepDot}>1</span>
            <span className={styles.stepDash}>—</span>
            <span className={step >= 2 ? styles.stepDotActive : styles.stepDot}>2</span>
            <span className={styles.stepDash}>—</span>
            <span className={step >= 3 ? styles.stepDotActive : styles.stepDot}>3</span>
            <span className={styles.stepDash}>—</span>
            <span className={step >= 4 ? styles.stepDotActive : styles.stepDot}>4</span>
            <span className={styles.stepDash}>—</span>
            <span className={styles.stepLabelEnd}>{lang === "en" ? "Payment" : "Pagamento"}</span>
          </div>

          <button className={styles.closeBtn} onClick={onClose} aria-label={lang === "en" ? "Close" : "Chiudi"}>
            ✕
          </button>
        </div>

        {/* ── UNIFIED STEP BODY CONTAINER ── */}
        <div className={styles.stepBodySingle}>
          {isLoadingSkeleton ? (
            <div className={styles.skeletonContainer}>
              <div className={styles.skeletonTopBlock} />
              <div className={styles.skeletonPillSmall} />
              <div className={styles.skeletonMediumBlock} />
              <div className={styles.skeletonPillSmall} />
              <div className={styles.skeletonLargeBlock} />
              <div className={styles.skeletonLargeBlock} />
            </div>
          ) : (
            <>
              {/* Static Top Summary Header */}
              {step < 5 && (
                <>
                  <div className={styles.summaryBlock}>
                    <span className={styles.subTitleText}>
                      {step === 1 ? "Universal Method Seminar" : `Universal Method Seminar — ${currentTierObj.name}`}
                    </span>

                    <div className={styles.priceDisplayRow}>
                      {step > 1 && currentTierObj.id === "full" && (
                        <span className={styles.topOldPriceStrikethrough}>160,00 €</span>
                      )}
                      <h1 className={styles.priceDisplay}>
                        {step === 1 ? (lang === "en" ? "Pass from €80 · Full Seminar €140" : "Pass da 80 € · Full Seminar 140 €") : `${currentTierObj.price},00 €`}
                      </h1>
                      {step > 1 && currentTierObj.id === "full" && (
                        <span className={styles.topDiscountBadge}>{lang === "en" ? "SAVE €20" : "RISPARMI 20 €"}</span>
                      )}
                    </div>

                    <p className={styles.locationText}>
                      {lang === "en" ? "Bracciano, Italy · 7 & 8 September 2026" : "Bracciano, Italia · 7 e 8 settembre 2026"}
                    </p>
                  </div>
                  <div className={styles.divider} />
                </>
              )}

              {/* Dynamic Middle Step Content (Only this animates) */}
              <div key={step} className={styles.dynamicStepContent}>
                {/* ── STEP 1: OVERVIEW & DETAILS ── */}
                {step === 1 && (
                  <div className={styles.sectionBlock}>
                    <h2 className={styles.sectionTitle}>{lang === "en" ? "Seminar Details" : "Dettagli del Seminario"}</h2>
                    <div className={styles.overviewSpecList}>
                      <div className={styles.overviewSpecItem}>
                        <span className={styles.overviewSpecLabel}>{lang === "en" ? "Lead Instructor" : "Docente Principale"}</span>
                        <span className={styles.overviewSpecValue}>Chris Collins</span>
                      </div>

                      <div className={styles.overviewSpecItem}>
                        <span className={styles.overviewSpecLabel}>{lang === "en" ? "Availability" : "Disponibilità"}</span>
                        <span className={styles.overviewSpecValue}>
                          {lang === "en" ? "Limited places — registration open until sold out" : "Posti limitati — iscrizione fino a esaurimento"}
                        </span>
                      </div>

                      <div className={styles.overviewSpecItem}>
                        <span className={styles.overviewSpecLabel}>{lang === "en" ? "Duration" : "Durata"}</span>
                        <span className={styles.overviewSpecValue}>
                          {lang === "en" ? "2 days · 6 hours of direct instruction with Chris Collins" : "2 giorni · 6 ore di formazione diretta con Chris Collins"}
                        </span>
                      </div>

                      <div className={styles.overviewSpecItem}>
                        <span className={styles.overviewSpecLabel}>{lang === "en" ? "Certification" : "Certificazione"}</span>
                        <span className={styles.overviewSpecValue}>
                          {lang === "en" ? "Official Certificate of Participation" : "Attestato di partecipazione"}
                        </span>
                      </div>

                      <div className={styles.overviewSpecItem}>
                        <span className={styles.overviewSpecLabel}>{lang === "en" ? "Technical Focus" : "Focus Tecnico"}</span>
                        <span className={styles.overviewSpecValue}>
                          {lang === "en" ? "Biomechanics · Timing · Pressure · Structure" : "Biomeccanica · Timing · Pressione · Struttura"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: PASS SELECTION ── */}
                {step === 2 && (
                  <>
                    <div className={styles.sectionBlock}>
                      <h2 className={styles.sectionTitle}>{dict.modal.step1Title}</h2>
                      <p className={styles.sectionSub}>
                        {lang === "en" ? "Choose your seminar participation pass" : "Scegli la formula di partecipazione al seminario"}
                      </p>
                    </div>

                    <div className={styles.tiersList}>
                      {tiers.map((tier) => {
                        const isSelected = selectedTier === tier.id;
                        const isFullTier = tier.id === "full";

                        return (
                          <div
                            key={tier.id}
                            className={`${styles.tierCardClean} ${isSelected ? styles.tierSelectedClean : ""} ${isFullTier ? styles.featuredTierCard : ""}`}
                            onClick={() => setSelectedTier(tier.id)}
                          >
                            <div className={styles.radioCircle}>
                              {isSelected && <div className={styles.radioDot} />}
                            </div>
                            <div className={styles.tierMainInfo}>
                              <div className={styles.tierTitleRow}>
                                <div className={styles.tierNameContainer}>
                                  <span className={styles.tierNameClean}>{tier.name}</span>
                                  {isFullTier && (
                                    <span className={styles.discountBadgeTag}>{lang === "en" ? "SAVE €20" : "RISPARMI 20 €"}</span>
                                  )}
                                </div>
                                <div className={styles.tierPriceGroup}>
                                  {isFullTier && (
                                    <span className={styles.oldPriceStrikethrough}>160,00 €</span>
                                  )}
                                  <span className={styles.tierPriceClean}>{tier.price},00 €</span>
                                </div>
                              </div>
                              <p className={styles.tierSubClean}>{tier.subtitle}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* ── STEP 3: I TUOI DATI ── */}
                {step === 3 && (
                  <form id="datiForm" onSubmit={(e) => { e.preventDefault(); handleNextToEsperienza(); }} className={styles.cleanForm}>
                    <h2 className={styles.sectionTitle}>{dict.modal.step2Title}</h2>

                    <div className={styles.fieldGroupClean}>
                      <label className={styles.fieldLabel}>{lang === "en" ? "Full Name *" : "Nome e cognome *"}</label>
                      <input
                        type="text"
                        required
                        placeholder={lang === "en" ? "e.g. John Doe" : "es. Mario Rossi"}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                      />
                    </div>

                    <div className={styles.fieldGroupClean}>
                      <label className={styles.fieldLabel}>Email *</label>
                      <input
                        type="email"
                        required
                        placeholder={lang === "en" ? "john.doe@email.com" : "mario.rossi@email.com"}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className={styles.fieldGroupClean}>
                      <label className={styles.fieldLabel}>{lang === "en" ? "Phone / WhatsApp *" : "Telefono / WhatsApp *"}</label>
                      <div className={styles.phoneInputRow}>
                        <select
                          className={styles.countryCodeSelect}
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                        >
                          <option value="+39">🇮🇹 +39</option>
                          <option value="+41">🇨🇭 +41</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+43">🇦🇹 +43</option>
                          <option value="+32">🇧🇪 +32</option>
                          <option value="+31">🇳🇱 +31</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+852">🇭🇰 +852</option>
                        </select>
                        <input
                          type="tel"
                          required
                          placeholder="333 1234567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={styles.phoneNumberInput}
                        />
                      </div>
                    </div>
                  </form>
                )}

                {/* ── STEP 4: LA TUA ESPERIENZA & PAGAMENTO ── */}
                {step === 4 && (
                  <>
                    {showDoubleConfirm ? (
                      <div className={styles.doubleConfirmClean}>
                        <h3 className={styles.warningTitleClean}>{lang === "en" ? "Email already registered" : "Email già registrata"}</h3>
                        <p className={styles.warningDescClean}>
                          {lang === "en" ? "There is already a confirmed booking for email " : "Risulta già un'iscrizione confermata per l'email "}<strong>{formData.email}</strong>.
                        </p>
                        <div className={styles.warningDetailsClean}>
                          <div><strong>{lang === "en" ? "Name:" : "Nome:"}</strong> {duplicateData.existingName}</div>
                          <div><strong>Pass ID:</strong> {duplicateData.existingTicketId}</div>
                          <div><strong>{lang === "en" ? "Pass Type:" : "Tipo Pass:"}</strong> {duplicateData.existingTier}</div>
                        </div>
                        <p className={styles.warningSubClean}>
                          {lang === "en" ? "Do you still wish to purchase an additional pass with this email?" : "Vuoi procedere comunque all'acquisto di un nuovo pass per questa email?"}
                        </p>
                      </div>
                    ) : (
                      <form id="esperienzaForm" onSubmit={handleProceedToStripeCheckout} className={styles.cleanForm}>
                        <h2 className={styles.sectionTitle}>{lang === "en" ? "Your Experience" : "La tua esperienza"}</h2>

                        <div className={styles.fieldGroupClean}>
                          <label className={styles.fieldLabel}>{lang === "en" ? "Martial System" : "Sistema marziale"}</label>
                          <div className={styles.customSelectWrapper}>
                            <CustomSelect
                              label=""
                              value={formData.system}
                              options={[
                                { value: "bjj", label: "BJJ (Jiu-Jitsu)" },
                                { value: "wing-tsun", label: "Wing Tsun" },
                                { value: "mma", label: "MMA / Striking" },
                                { value: "karate", label: "Karate / Kung Fu" },
                                { value: "other", label: lang === "en" ? "Other System" : "Altro Sistema" },
                              ]}
                              onChange={(val) => setFormData({ ...formData, system: val })}
                            />
                          </div>
                        </div>

                        <div className={styles.fieldGroupClean}>
                          <label className={styles.fieldLabel}>{lang === "en" ? "Experience Level" : "Livello di esperienza"}</label>
                          <CustomSelect
                            label=""
                            value={formData.experience}
                            options={[
                              { value: "beginner", label: lang === "en" ? "Beginner (0 - 1 Year)" : "Principiante (0 - 1 Anno)" },
                              { value: "intermediate", label: lang === "en" ? "Intermediate (1 - 4 Years)" : "Intermedio (1 - 4 Anni)" },
                              { value: "advanced", label: lang === "en" ? "Advanced / Black Belt" : "Avanzato / Cintura Nera" },
                            ]}
                            onChange={(val) => setFormData({ ...formData, experience: val })}
                          />
                        </div>

                        {/* Final Order Confirmation Card */}
                        <div className={styles.finalCheckoutCard}>
                          <div className={styles.finalCheckoutTitle}>{currentTierObj.name}</div>
                          <div className={styles.finalCheckoutSub}>{lang === "en" ? "7 & 8 September 2026 · Bracciano" : "7 e 8 settembre 2026 · Bracciano"}</div>
                          <div className={styles.finalCheckoutTotalRow}>
                            <span>{lang === "en" ? "Total:" : "Totale:"}</span>
                            <strong>{currentTierObj.price},00 €</strong>
                          </div>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {/* ── STEP 5: CONFIRMATION "YOU ARE IN" ── */}
                {step === 5 && (
                  <div className={styles.confirmWrapper}>
                    <div className={styles.confirmBadgeIcon}>✓</div>

                    <div className={styles.confirmHeaderClean}>
                      <h1 className={styles.confirmTitleClean}>{lang === "en" ? "Registration Confirmed!" : "Iscrizione Confermata!"}</h1>
                      <p className={styles.confirmSubClean}>
                        {dict.modal.ticketConfirmed}
                      </p>
                    </div>

                    <div className={styles.ticketPassClean}>
                      <div className={styles.ticketHeaderClean}>
                        <span>UNIVERSAL METHOD SEMINAR</span>
                        <span className={styles.ticketIdBadge}>{ticketId || "UMS-2026"}</span>
                      </div>

                      <div className={styles.ticketGridClean}>
                        <div>
                          <span className={styles.tLabelClean}>{lang === "en" ? "PARTICIPANT" : "PARTECIPANTE"}</span>
                          <span className={styles.tValClean}>{formData.name || (lang === "en" ? "Confirmed Participant" : "Partecipante Confermato")}</span>
                        </div>
                        <div>
                          <span className={styles.tLabelClean}>{lang === "en" ? "PASS TYPE" : "TIPO DI PASS"}</span>
                          <span className={styles.tValBlueClean}>{currentTierObj.name}</span>
                        </div>
                        <div>
                          <span className={styles.tLabelClean}>{lang === "en" ? "DATES & TIMES" : "DATE E ORARI"}</span>
                          <span className={styles.tValClean}>{lang === "en" ? "7 & 8 September 2026" : "7 e 8 Settembre 2026"}</span>
                        </div>
                        <div>
                          <span className={styles.tLabelClean}>{lang === "en" ? "LOCATION" : "LUOGO"}</span>
                          <span className={styles.tValClean}>Bracciano (RM), Italia</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.actionRowCenterColumn} style={{ marginTop: "auto", width: "100%", paddingTop: "16px" }}>
                      <div className={styles.actionRowBetween} style={{ width: "100%", marginTop: 0 }}>
                        <button
                          className={styles.btnSecondary}
                          onClick={onClose}
                        >
                          {lang === "en" ? "Close" : "Chiudi"}
                        </button>

                        <button
                          className={styles.btnPrimary}
                          onClick={handleDownloadTicket}
                        >
                          {lang === "en" ? "Download Ticket →" : "Scarica Biglietto →"}
                        </button>
                      </div>

                      <p className={styles.stripeSecuritySubtext}>
                        {lang === "en" ? "✉️ we sent confirmation and ticket to " : "✉️ abbiamo inviato la conferma ed il biglietto a "}<strong>{formData.email || (lang === "en" ? "your email" : "tua email")}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Static Bottom Action Buttons for Steps 1-4 */}
              {step === 1 && (
                <div className={styles.actionRowEnd}>
                  <button className={styles.btnPrimary} onClick={handleNextToTier}>
                    {lang === "en" ? "Continue →" : "Continua →"}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className={styles.actionRowBetween}>
                  <button className={styles.btnSecondary} onClick={handleBack}>
                    {lang === "en" ? "← Back" : "← Indietro"}
                  </button>
                  <button className={styles.btnPrimary} onClick={handleNextToDati}>
                    {lang === "en" ? "Continue →" : "Continua →"}
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className={styles.actionRowBetween}>
                  <button className={styles.btnSecondary} onClick={handleBack}>
                    {lang === "en" ? "← Back" : "← Indietro"}
                  </button>
                  <button type="submit" form="datiForm" className={styles.btnPrimary}>
                    {lang === "en" ? "Continue →" : "Continua →"}
                  </button>
                </div>
              )}

              {step === 4 && (
                <>
                  {showDoubleConfirm ? (
                    <div className={styles.actionRowBetween} style={{ marginTop: "20px" }}>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => setShowDoubleConfirm(false)}
                      >
                        {lang === "en" ? "Change Email" : "Cambia Email"}
                      </button>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={executeStripeRedirect}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (lang === "en" ? "Redirecting..." : "Reindirizzamento...") : (lang === "en" ? `Proceed to secure payment (${currentTierObj.price},00 €) →` : `Vai al pagamento sicuro (${currentTierObj.price},00 €) →`)}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.actionRowCenterColumn} style={{ marginTop: "16px" }}>
                      <div className={styles.actionRowBetween} style={{ width: "100%", marginTop: 0 }}>
                        <button type="button" className={styles.btnSecondary} onClick={handleBack}>
                          {lang === "en" ? "← Back" : "← Indietro"}
                        </button>
                        <button
                          type="submit"
                          form="esperienzaForm"
                          className={styles.btnPrimary}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (lang === "en" ? "Redirecting..." : "Reindirizzamento...") : (lang === "en" ? "Proceed to secure payment →" : "Vai al pagamento sicuro →")}
                        </button>
                      </div>
                      <p className={styles.stripeSecuritySubtext}>
                        {lang === "en" ? "🔒 Secure payment powered by Stripe" : "🔒 Pagamento sicuro gestito da Stripe"}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Static Bottom Legal Footer */}
              <div className={styles.legalFooterRow}>
                <button
                  type="button"
                  className={styles.legalLink}
                  onClick={openTerms}
                >
                  {lang === "en" ? "Terms & Conditions" : "Termini e Condizioni"}
                </button>
                <span className={styles.legalDot}>•</span>
                <button
                  type="button"
                  className={styles.legalLink}
                  onClick={openSupport}
                >
                  {lang === "en" ? "Support" : "Assistenza"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── TERMINI E CONDIZIONI OVERLAY (OFFICIAL LEGAL STYLE) ── */}
        {showTermsModal && (
          <div className={styles.legalOverlay} onClick={closeTerms}>
            <div className={styles.legalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.legalHeader}>
                <div>
                  <h3 className={styles.legalHeaderTitle}>Termini e Condizioni di Vendita e Partecipazione</h3>
                  <span className={styles.legalHeaderSub}>UNIVERSAL METHOD SEMINAR • DOCUMENTO UFFICIALE</span>
                </div>
                <button className={styles.legalCloseBtn} onClick={closeTerms}>✕</button>
              </div>

              <div className={styles.legalBody}>
                <div className={styles.legalMetaBox}>
                  <strong>Ente Organizzatore:</strong> Universal Method Seminar S.r.l. / A.S.D.<br />
                  <strong>Sede Legale:</strong> Via Garibaldi 12, 00062 Bracciano (RM), Italia<br />
                  <strong>P.IVA / C.F.:</strong> IT 09876543210 &nbsp;•&nbsp; <strong>Reg. Imprese:</strong> RM - 149204
                </div>

                <h4>1. Oggetto del Contratto ed Accesso all'Evento</h4>
                <p>
                  L'acquisto del titolo di ingresso (Pass) disciplina il diritto di partecipazione individuale all'Universal Method Seminar tenuto da Chris Collins nei giorni 7 e 8 Settembre 2026 presso la sede dell'evento a Bracciano (RM). Il numero dei partecipanti è limitato a 30 praticanti per garantire la qualità dell'insegnamento.
                </p>

                <h4>2. Diritto di Recesso e Politica di Cancellazione</h4>
                <p>
                  Ai sensi dell'art. 52 del D.Lgs. 206/2005 (Codice del Consumo), l'acquirente ha diritto di recedere dal contratto ed ottenere il rimborso integrale dell'importo versato entro 14 giorni dalla data di acquisto.
                </p>

                <h4>3. Trasferibilità del Biglietto</h4>
                <p>
                  Decorsi i 14 giorni dal pagamento, l'importo non è rimborsabile. Tuttavia, il biglietto è nominativo e liberamente trasferibile ad un altro praticante fino a 48 ore prima dell'inizio delle sessioni, previa comunicazione scritta all'assistenza organizzativa.
                </p>

                <h4>4. Requisiti di Idoneità Fisica e Condotta</h4>
                <p>
                  Ogni partecipante dichiara sotto la propria responsabilità di essere in stato di buona salute psicofisica e di possedere idoneità alla pratica di attività marziali e sportive. L'organizzazione si riserva il diritto di allontanare i partecipanti che tengano una condotta lesiva per la sicurezza propria o altrui.
                </p>

                <h4>5. Protezione dei Dati Personali (GDPR EU 2016/679)</h4>
                <p>
                  I dati raccolti (Nome, Email, Telefono) vengono trattati nel rispetto della normativa europea sul GDPR esclusivamente per l'emissione ed invio del biglietto di ingresso e comunicazioni logistiche inerenti il seminario.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── ASSISTENZA OVERLAY (OFFICIAL SUPPORT CENTER) ── */}
        {showSupportModal && (
          <div className={styles.legalOverlay} onClick={closeSupport}>
            <div className={styles.legalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.legalHeader}>
                <div>
                  <h3 className={styles.legalHeaderTitle}>Centro Assistenza Partecipanti</h3>
                  <span className={styles.legalHeaderSub}>SUPPORTO ISCRIZIONI, FATTURAZIONE E LOGISTICA</span>
                </div>
                <button className={styles.legalCloseBtn} onClick={closeSupport}>✕</button>
              </div>

              <div className={styles.legalBody}>
                <p className={styles.supportIntro}>
                  Per qualsiasi dubbio su iscrizioni, modalità di pagamento, sistemazione alberghiera a Bracciano o fatturazione elettronica, puoi contattare direttamente il segretariato organizzativo:
                </p>

                <div className={styles.supportChannelCard}>
                  <div className={styles.channelHeader}>
                    <strong>Supporto Ufficiale via Email</strong>
                    <span className={styles.channelBadge}>RISPOSTA ENTRO 2 ORE</span>
                  </div>
                  <p className={styles.channelDesc}>Per informazioni generali, modifiche ai dati del biglietto e richieste amministrative.</p>
                  <a href="mailto:yimwckf@gmail.com" className={styles.channelLink}>
                    yimwckf@gmail.com
                  </a>
                </div>

                <div className={styles.supportChannelCard}>
                  <div className={styles.channelHeader}>
                    <strong>WhatsApp e Assistenza Telefonica</strong>
                    <span className={styles.channelBadge}>LUN - SAB: 09:00 - 19:00</span>
                  </div>
                  <p className={styles.channelDesc}>Per assistenza immediata e supporto diretto sulla posizione della palestra ed orari.</p>
                  <a href="https://wa.me/393290076810" target="_blank" rel="noopener noreferrer" className={styles.channelLink}>
                    +39 329 007 6810
                  </a>
                </div>

                <div className={styles.supportInvoiceNote}>
                  <strong>Richiesta Fattura Elettronica / Aziendale:</strong><br />
                  Se hai bisogno di fattura intestata alla tua Società / P.IVA o Associazione Sportiva, rispondi semplicemente alla mail di conferma inviando la Ragione Sociale ed il Codice SDI.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
