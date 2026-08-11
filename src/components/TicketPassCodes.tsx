"use client";

import React from "react";
import TicketQRCode from "./TicketQRCode";

interface TicketPassCodesProps {
  ticketId: string;
  qrSize?: number;
  darkTheme?: boolean;
}

export default function TicketPassCodes({
  ticketId,
  qrSize = 130,
  darkTheme = false,
}: TicketPassCodesProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "16px 20px",
        background: darkTheme ? "#141417" : "#faf8f3",
        border: `1px solid ${darkTheme ? "#27272a" : "#e1e1e6"}`,
        borderRadius: "10px",
      }}
    >
      <span
        style={{
          fontSize: "10px",
          color: darkTheme ? "#a1a1aa" : "#666666",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        QR CODE PASS ACCESSO
      </span>

      <TicketQRCode ticketId={ticketId} size={qrSize} />

      <span
        style={{
          fontFamily: "monospace",
          fontSize: "12px",
          fontWeight: 700,
          color: "#e1a10b",
          letterSpacing: "0.1em",
        }}
      >
        {ticketId}
      </span>
    </div>
  );
}
