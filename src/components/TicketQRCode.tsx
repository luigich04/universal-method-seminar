"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

interface TicketQRCodeProps {
  ticketId: string;
  size?: number;
  showText?: boolean;
}

export default function TicketQRCode({
  ticketId,
  size = 120,
  showText = false,
}: TicketQRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!ticketId) return;

    QRCode.toDataURL(ticketId, {
      margin: 1,
      width: size * 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.warn("Error generating QR code:", err));
  }, [ticketId, size]);

  if (!dataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: "#ffffff",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          color: "#888888",
        }}
      >
        QR...
      </div>
    );
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <img
        src={dataUrl}
        alt={`QR Code ${ticketId}`}
        width={size}
        height={size}
        style={{ borderRadius: "4px", background: "#ffffff", padding: "4px" }}
      />
      {showText && (
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "10px",
            fontWeight: 700,
            color: "#e1a10b",
            letterSpacing: "0.08em",
          }}
        >
          {ticketId}
        </span>
      )}
    </div>
  );
}
