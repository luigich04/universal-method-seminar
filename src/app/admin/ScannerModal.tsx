"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./admin.module.css";
import TicketBarcode from "@/components/TicketBarcode";
import TicketPassCodes from "@/components/TicketPassCodes";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface BookingRecord {
  id: string;
  ticketId: string;
  fullName: string;
  email: string;
  phone: string;
  martialSystem: string;
  experienceLevel: string;
  tierName: string;
  paymentStatus: string;
  attended: boolean;
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
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio autoplay policy restrictions
  }
};

export default function ScannerModal({
  bookings,
  onClose,
  onAttendanceToggle,
}: ScannerModalProps) {
  const [scannedCode, setScannedCode] = useState("");
  const [activeCamera, setActiveCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState<{
    status: "success" | "already" | "not_found";
    message: string;
    booking?: BookingRecord;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);

  // Auto-focus manual/laser input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Global listener for USB laser barcode scanners
  useEffect(() => {
    let buffer = "";
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hardware laser scanners send characters rapidly followed by Enter key
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

  // Universal Html5Qrcode Camera Scanner Engine with 1D Barcode Support
  useEffect(() => {
    if (activeCamera) {
      setCameraError("");
      setIsScanningActive(true);

      // Support Code 128, Code 39, QR Code, EAN, UPC formats
      const html5Qrcode = new Html5Qrcode("reader", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        verbose: false,
      });

      scannerRef.current = html5Qrcode;

      const config = {
        fps: 15,
        qrbox: { width: 300, height: 180 },
        aspectRatio: 1.333333,
      };

      html5Qrcode
        .start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            const now = Date.now();
            // Throttle duplicate reads within 2 seconds
            if (now - lastProcessedTimeRef.current > 2000) {
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
            "Impossibile accedere alla fotocamera. Assicurati che il browser abbia i permessi attivi e stia usando HTTPS o Localhost."
          );
          setActiveCamera(false);
          setIsScanningActive(false);
        });
    }

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch((e) => console.warn("Error stopping scanner:", e));
        }
      }
      setIsScanningActive(false);
    };
  }, [activeCamera]);

  const processTicketScan = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setScannedCode(cleanCode);

    // Find participant by Ticket ID or Email or Phone
    const found = bookings.find(
      (b) =>
        b.ticketId.toUpperCase() === cleanCode ||
        b.email.toLowerCase() === cleanCode.toLowerCase() ||
        b.ticketId.toUpperCase().replace("-", "") === cleanCode.replace("-", "")
    );

    if (!found) {
      playBeep(350, 0.25); // Warning low beep
      setLastScannedResult({
        status: "not_found",
        message: `❌ Nessun biglietto trovato per il codice: ${cleanCode}`,
      });
      return;
    }

    if (found.attended) {
      playBeep(520, 0.2); // Double notice beep
      setLastScannedResult({
        status: "already",
        message: `⚠️ Partecipante GIÀ PRESENTE al seminario!`,
        booking: found,
      });
    } else {
      playBeep(880, 0.18); // Success high beep
      // Mark as attended
      await onAttendanceToggle(found.ticketId, false);
      setLastScannedResult({
        status: "success",
        message: `✓ CHECK-IN CONFERMATO! Presenza registrata.`,
        booking: { ...found, attended: true },
      });
    }
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    processTicketScan(scannedCode);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>SCANNER PASS & CHECK-IN IN SALA</h3>
            <p style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "2px" }}>
              Fotocamera live con feedback sonoro, lettore laser USB o ricerca Ticket ID
            </p>
          </div>
          <button className={styles.closeModalBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Camera Toggle & Scanner Viewport */}
        <div style={{ marginBottom: "20px" }}>
          {!activeCamera ? (
            <button
              type="button"
              className={styles.actionBtn}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "14px",
                fontSize: "13px",
                fontWeight: 700,
                background: "#1c1913",
                color: "#e1a10b",
                border: "1px solid #3d321d",
              }}
              onClick={() => setActiveCamera(true)}
            >
              📷 ATTIVA FOTOCAMERA SCANNER LIVE (CODE 128 / BARCODE / QR)
            </button>
          ) : (
            <div style={{ position: "relative", background: "#09090b", borderRadius: "8px", overflow: "hidden", border: "1px solid #27272a" }}>
              {isScanningActive && (
                <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 10, background: "rgba(12,39,29,0.85)", color: "#34d399", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                  FOTOCAMERA ATTIVA — Inquadra il codice
                </div>
              )}
              <div id="reader" style={{ width: "100%", minHeight: "260px" }} />
              <button
                type="button"
                className={styles.actionBtn}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  padding: "6px 12px",
                  fontSize: "11px",
                  zIndex: 10,
                  background: "#27272a",
                }}
                onClick={() => setActiveCamera(false)}
              >
                SPEGNI FOTOCAMERA
              </button>
            </div>
          )}

          {cameraError && (
            <div style={{ marginTop: "10px", padding: "10px", borderRadius: "6px", background: "#2b1111", border: "1px solid #ef4444", color: "#f87171", fontSize: "12px" }}>
              {cameraError}
            </div>
          )}
        </div>

        {/* Laser / Manual Code Input Form */}
        <form onSubmit={handleSubmitManual} style={{ marginBottom: "20px" }}>
          <label className={styles.formLabel}>TICKET ID O SCANNER LASER USB</label>
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <input
              ref={inputRef}
              type="text"
              className={styles.formInput}
              placeholder="Es. UMS-4616..."
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              style={{ fontSize: "15px", fontFamily: "monospace", letterSpacing: "0.08em" }}
            />
            <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
              VERIFICA
            </button>
          </div>
        </form>

        {/* Quick Test Sample Ticket Buttons */}
        {bookings.length > 0 && (
          <div style={{ marginBottom: "20px", padding: "12px", background: "#121215", borderRadius: "6px", border: "1px solid #27272a" }}>
            <div style={{ fontSize: "11px", color: "#a1a1aa", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
              TEST RAPIDO — CLICCA UN ISCRITTO PER PROVARE IL CHECK-IN:
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {bookings.slice(0, 4).map((b) => (
                <button
                  key={b.ticketId}
                  type="button"
                  onClick={() => processTicketScan(b.ticketId)}
                  className={styles.badgeTag}
                  style={{
                    cursor: "pointer",
                    background: b.attended ? "#0c271d" : "#241d11",
                    color: b.attended ? "#34d399" : "#e1a10b",
                    border: `1px solid ${b.attended ? "#10b981" : "#e1a10b"}`,
                  }}
                >
                  {b.fullName} ({b.ticketId}) {b.attended ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scan Result Feedback Card */}
        {lastScannedResult && (
          <div
            style={{
              padding: "18px",
              borderRadius: "8px",
              border: `1px solid ${
                lastScannedResult.status === "success"
                  ? "#10b981"
                  : lastScannedResult.status === "already"
                  ? "#f59e0b"
                  : "#ef4444"
              }`,
              background:
                lastScannedResult.status === "success"
                  ? "#0c271d"
                  : lastScannedResult.status === "already"
                  ? "#281d09"
                  : "#2b1111",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color:
                  lastScannedResult.status === "success"
                    ? "#34d399"
                    : lastScannedResult.status === "already"
                    ? "#fbbf24"
                    : "#f87171",
              }}
            >
              {lastScannedResult.message}
            </div>

            {lastScannedResult.booking && (
              <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px" }}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
                  {lastScannedResult.booking.fullName}
                </div>
                <div style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "2px" }}>
                  {lastScannedResult.booking.email} • {lastScannedResult.booking.phone}
                </div>
                <div style={{ fontSize: "12px", color: "#e1a10b", marginTop: "4px" }}>
                  Pass: <strong>{lastScannedResult.booking.tierName}</strong> | Disciplina: {lastScannedResult.booking.martialSystem}
                </div>
                <div style={{ marginTop: "12px" }}>
                  <TicketPassCodes ticketId={lastScannedResult.booking.ticketId} darkTheme={true} qrSize={85} barcodeWidth={170} barcodeHeight={38} />
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.modalFooter}>
          <button className={styles.actionBtn} onClick={onClose}>
            CHIUDI SCANNER
          </button>
        </div>
      </div>
    </div>
  );
}
