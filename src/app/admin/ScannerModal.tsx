"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./admin.module.css";
import TicketBarcode from "@/components/TicketBarcode";
import { Html5Qrcode } from "html5-qrcode";

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

export default function ScannerModal({
  bookings,
  onClose,
  onAttendanceToggle,
}: ScannerModalProps) {
  const [scannedCode, setScannedCode] = useState("");
  const [activeCamera, setActiveCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [lastScannedResult, setLastScannedResult] = useState<{
    status: "success" | "already" | "not_found";
    message: string;
    booking?: BookingRecord;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

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
        if (buffer.length >= 4) {
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

  // Universal Html5Qrcode Camera Scanner Engine
  useEffect(() => {
    if (activeCamera) {
      setCameraError("");
      const html5Qrcode = new Html5Qrcode("reader");
      scannerRef.current = html5Qrcode;

      const config = {
        fps: 10,
        qrbox: { width: 260, height: 180 },
        aspectRatio: 1.333333,
      };

      html5Qrcode
        .start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (decodedText) {
              processTicketScan(decodedText);
            }
          },
          () => {
            // Ignore frame decode notices
          }
        )
        .catch((err) => {
          console.warn("Camera start error:", err);
          setCameraError(
            "Impossibile accedere alla fotocamera. Assicurati di aver concesso i permessi nel browser o di usare un indirizzo HTTPS / Localhost."
          );
          setActiveCamera(false);
        });
    }

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch((e) => console.warn("Error stopping scanner:", e));
        }
      }
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
      setLastScannedResult({
        status: "not_found",
        message: `Nessun biglietto trovato per il codice: ${cleanCode}`,
      });
      return;
    }

    if (found.attended) {
      setLastScannedResult({
        status: "already",
        message: `Partecipante GIÀ PRESENTE al seminario!`,
        booking: found,
      });
    } else {
      // Mark as attended
      await onAttendanceToggle(found.ticketId, false);
      setLastScannedResult({
        status: "success",
        message: `CHECK-IN CONFERMATO! Presenza registrata.`,
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
              Fotocamera live, lettore laser USB o ricerca manuale per Ticket ID
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
              📷 ATTIVA FOTOCAMERA SCANNER LIVE (QR / BARCODE)
            </button>
          ) : (
            <div style={{ position: "relative", background: "#09090b", borderRadius: "8px", overflow: "hidden", border: "1px solid #27272a" }}>
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
          <label className={styles.formLabel}>TICKET ID O CODICE LETTORE LASER USB</label>
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
              TEST RAPIDO — CLICCA UN ISCRITTO PER PROVARE LO SCANNER:
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
                  <TicketBarcode ticketId={lastScannedResult.booking.ticketId} height={40} width={220} />
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
