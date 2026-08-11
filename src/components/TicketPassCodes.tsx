"use client";

import React from "react";
import TicketBarcode from "./TicketBarcode";
import TicketQRCode from "./TicketQRCode";

interface TicketPassCodesProps {
  ticketId: string;
  qrSize?: number;
  barcodeWidth?: number;
  barcodeHeight?: number;
  darkTheme?: boolean;
}

export default function TicketPassCodes({
  ticketId,
  qrSize = 110,
  barcodeWidth = 200,
  barcodeHeight = 44,
  darkTheme = false,
}: TicketPassCodesProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
        padding: "12px 16px",
        background: darkTheme ? "#141417" : "#faf8f3",
        border: `1px solid ${darkTheme ? "#27272a" : "#e1e1e6"}`,
        borderRadius: "8px",
        flexWrap: "wrap",
      }}
    >
      {/* 2D QR Code */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: "9.5px", color: darkTheme ? "#a1a1aa" : "#666666", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          QR CODE PASS
        </span>
        <TicketQRCode ticketId={ticketId} size={qrSize} />
      </div>

      <div
        style={{
          width: "1px",
          height: "90px",
          background: darkTheme ? "#27272a" : "#d8d2c4",
        }}
      />

      {/* 1D Barcode */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: "9.5px", color: darkTheme ? "#a1a1aa" : "#666666", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          BARCODE (CODE 128)
        </span>
        <TicketBarcode ticketId={ticketId} width={barcodeWidth} height={barcodeHeight} showText={true} />
      </div>
    </div>
  );
}
