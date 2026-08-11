"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./admin.module.css";
import TicketPassCodes from "@/components/TicketPassCodes";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface BookingRecord {
  id: string;
  ticketId: string;
  stripeSessionId?: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  martialSystem: string;
  experienceLevel: string;
  tierName: string;
  amountPaid: number;
  paymentStatus: string;
  paymentMethod: string;
  attended: boolean;
  notes?: string;
}

interface ScannerModalProps {
  bookings: BookingRecord[];
  onClose: () => void;
  onAttendanceToggle: (ticketId: string, currentAttended: boolean) => Promise<void>;
}

// Web Audio API Beep Synthesizer for instant check-in sound feedback
const playBeep = (freq = 880, duration = 0.18) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio policy notices
  }
};

export default function ScannerModal({
  bookings,
  onClose,
  onAttendanceToggle,
}: ScannerModalProps) {
  const [scannedCode, setScannedCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [bubbleNotice, setBubbleNotice] = useState<{
    type: "success" | "already" | "error";
    text: string;
  } | null>(null);

  // Fullscreen Customer Profile Modal State
  const [scannedCustomer, setScannedCustomer] = useState<BookingRecord | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);

  // Auto-start camera on mount
  useEffect(() => {
    setCameraError("");

    const html5Qrcode = new Html5Qrcode("reader", {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
      ],
      verbose: false,
    });

    scannerRef.current = html5Qrcode;

    const config = {
      fps: 15,
      qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
        const minDim = Math.min(viewfinderWidth, viewfinderHeight);
        const width = Math.min(Math.floor(minDim * 0.75), 320);
        return { width, height: width };
      },
      aspectRatio: 1.0,
    };

    html5Qrcode
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          const now = Date.now();
          if (now - lastProcessedTimeRef.current > 1800) {
            lastProcessedTimeRef.current = now;
            if (decodedText) {
              processTicketScan(decodedText);
            }
          }
        },
        () => {
          // Frame decode notice
        }
      )
      .catch((err) => {
        console.warn("Camera start error:", err);
        setCameraError(
          "Impossibile accedere alla fotocamera. Verifica che i permessi siano concessi sul browser."
        );
      });

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch((e) => console.warn("Error stopping scanner:", e));
        }
      }
    };
  }, []);

  // Global listener for USB laser barcode scanners
  useEffect(() => {
    let buffer = "";
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (buffer.length >= 3) {
          processTicketScan(buffer.trim());
          buffer = "";
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          buffer = "";
        }, 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, [bookings]);

  const triggerBubbleNotice = (type: "success" | "already" | "error", text: string) => {
    setBubbleNotice({ type, text });
    setTimeout(() => {
      setBubbleNotice(null);
    }, 4500);
  };

  const processTicketScan = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setScannedCode(cleanCode);
    const cleanCodeNoDash = cleanCode.replace(/[^A-Z0-9]/g, "");

    // Find participant by Ticket ID, Stripe Session ID, Email, or Short Suffix Code
    const found = bookings.find((b) => {
      const bTicketNoDash = (b.ticketId || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const bStripeNoDash = (b.stripeSessionId || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const bEmail = (b.email || "").toLowerCase();

      return (
        b.ticketId.toUpperCase() === cleanCode ||
        bEmail === cleanCode.toLowerCase() ||
        (b.stripeSessionId && b.stripeSessionId.toUpperCase() === cleanCode) ||
        bTicketNoDash === cleanCodeNoDash ||
        bTicketNoDash.endsWith(cleanCodeNoDash) ||
        cleanCodeNoDash.endsWith(bTicketNoDash) ||
        (bStripeNoDash && bStripeNoDash.endsWith(cleanCodeNoDash)) ||
        (bStripeNoDash && cleanCodeNoDash.endsWith(bStripeNoDash.slice(-6)))
      );
    });

    if (!found) {
      playBeep(350, 0.25);
      triggerBubbleNotice("error", `❌ Codice non trovato: ${cleanCode}`);
      return;
    }

    // Automatically mark attendance as PRESENTE if not already attended
    if (!found.attended) {
      await onAttendanceToggle(found.ticketId, false);
      found.attended = true;
      playBeep(880, 0.18);
      triggerBubbleNotice("success", `✓ PRESENTE REGISTRATO: ${found.fullName}`);
    } else {
      playBeep(520, 0.2);
      triggerBubbleNotice("already", `⚠️ Già registrato: ${found.fullName}`);
    }

    // Open Fullscreen Customer Profile Modal
    setScannedCustomer(found);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processTicketScan(scannedCode);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#000000",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top Floating Glassmorphism Navigation Bar ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.05em" }}>
              SCANNER LIVE SALA
            </div>
            <div style={{ fontSize: "11px", color: "#a1a1aa" }}>Inquadra QR Code o Barcode</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className={styles.actionBtn}
            style={{ padding: "8px 14px", fontSize: "12px", background: "rgba(39,39,42,0.8)" }}
            onClick={() => {
              setShowManualInput(!showManualInput);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
          >
            {showManualInput ? "NASTRI FOTOCAMERA" : "🔍 CERCA TICKET"}
          </button>
          <button
            type="button"
            className={styles.closeModalBtn}
            style={{ width: "36px", height: "36px", fontSize: "16px", background: "rgba(255,255,255,0.15)", borderRadius: "50%" }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── TOP NOTIFICATION BUBBLE (FLOAT CENTER) ── */}
      {bubbleNotice && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            padding: "12px 22px",
            borderRadius: "30px",
            background:
              bubbleNotice.type === "success"
                ? "#0c271d"
                : bubbleNotice.type === "already"
                ? "#281d09"
                : "#2b1111",
            border: `1px solid ${
              bubbleNotice.type === "success"
                ? "#10b981"
                : bubbleNotice.type === "already"
                ? "#f59e0b"
                : "#ef4444"
            }`,
            color:
              bubbleNotice.type === "success"
                ? "#34d399"
                : bubbleNotice.type === "already"
                ? "#fbbf24"
                : "#f87171",
            fontSize: "14px",
            fontWeight: 800,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
            maxWidth: "90vw",
            textAlign: "center",
          }}
        >
          {bubbleNotice.text}
        </div>
      )}

      {/* ── Manual Search / Laser Barcode Form Drawer ── */}
      {showManualInput && (
        <form
          onSubmit={handleManualSubmit}
          style={{
            position: "absolute",
            top: "75px",
            left: "20px",
            right: "20px",
            zIndex: 150,
            background: "#121215",
            border: "1px solid #27272a",
            padding: "14px",
            borderRadius: "12px",
            display: "flex",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className={styles.formInput}
            placeholder="Digita Ticket ID (es. UMS-4616), Nome o Email..."
            value={scannedCode}
            onChange={(e) => setScannedCode(e.target.value)}
            style={{ fontSize: "15px", fontFamily: "monospace" }}
          />
          <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} style={{ whiteSpace: "nowrap" }}>
            VERIFICA
          </button>
        </form>
      )}

      {/* ── FULLSCREEN LIVE CAMERA VIEWPORT ── */}
      <div style={{ flex: 1, width: "100%", height: "100%", position: "relative" }}>
        <div id="reader" style={{ width: "100%", height: "100%", objectFit: "cover" }} />

        {cameraError && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#18181b",
              border: "1px solid #ef4444",
              padding: "24px",
              borderRadius: "12px",
              color: "#f87171",
              maxWidth: "85vw",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>ERRORE FOTOCAMERA</div>
            <div style={{ fontSize: "13px", color: "#a1a1aa" }}>{cameraError}</div>
          </div>
        )}
      </div>

      {/* ── FULLSCREEN CUSTOMER PROFILE SHEET MODAL (ON SCAN MATCH) ── */}
      {scannedCustomer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setScannedCustomer(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#121215",
              border: "1px solid #27272a",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.9)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Close */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span className={styles.badgePaid} style={{ background: "#0c271d", color: "#34d399", border: "1px solid #10b981", fontSize: "12px", fontWeight: 800 }}>
                ✓ REGISTRATO PRESENTE
              </span>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setScannedCustomer(null)}
              >
                ✕
              </button>
            </div>

            {/* Customer Avatar & Primary Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#1f1f24",
                  border: "2px solid #e1a10b",
                  color: "#e1a10b",
                  fontSize: "18px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {scannedCustomer.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  {scannedCustomer.fullName}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span className={styles.ticketCode}>{scannedCustomer.ticketId}</span>
                  <span style={{ fontSize: "12px", color: "#71717a" }}>• {scannedCustomer.email}</span>
                </div>
              </div>
            </div>

            {/* Details Box */}
            <div style={{ background: "#18181c", borderRadius: "10px", padding: "16px", border: "1px solid #27272a", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                <span style={{ color: "#a1a1aa" }}>Tipo Pass:</span>
                <strong style={{ color: "#e1a10b" }}>{scannedCustomer.tierName} (€{scannedCustomer.amountPaid}.00)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                <span style={{ color: "#a1a1aa" }}>Disciplina:</span>
                <strong style={{ color: "#ffffff" }}>{scannedCustomer.martialSystem} — {scannedCustomer.experienceLevel}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#a1a1aa" }}>Stato Pagamento:</span>
                <span className={styles.badgePaid}>{scannedCustomer.paymentStatus} ({scannedCustomer.paymentMethod})</span>
              </div>

              {scannedCustomer.phone && (
                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#a1a1aa" }}>Telefono: {scannedCustomer.phone}</span>
                  <a
                    href={`https://wa.me/${scannedCustomer.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waBtn}
                    style={{ padding: "4px 10px", fontSize: "12px" }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              )}
            </div>

            {/* QR Code Pass Display */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <TicketPassCodes ticketId={scannedCustomer.ticketId} darkTheme={true} qrSize={90} />
            </div>

            {/* Large Next Scan Action Button */}
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "16px",
                fontSize: "15px",
                fontWeight: 800,
                borderRadius: "10px",
              }}
              onClick={() => setScannedCustomer(null)}
            >
              PROSSIMA SCANSIONE ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
