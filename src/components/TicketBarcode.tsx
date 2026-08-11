"use client";

import React from "react";

// Code 128B Encoding Table for alphanumeric barcode generation
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312",
  "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222",
  "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131",
  "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321",
  "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121",
  "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321",
  "313112", "331121", "312113", "312311", "332111", "314111", "221411", "431111",
  "111224", "111422", "121124", "121421", "141122", "141221", "112214", "112412",
  "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112",
  "134111", "111242", "121142", "121241", "114212", "124112", "124211", "411212",
  "421112", "421211", "212141", "214121", "412121", "111143", "111341", "131141",
  "114113", "114311", "411113", "411311", "113141", "114131", "311141", "411131",
  "211412", "211214", "211232", "2331112"
];

export function encodeCode128B(text: string): string {
  let checksum = 104; // Start B
  let result = CODE128_PATTERNS[104];

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const val = charCode - 32;
    if (val >= 0 && val <= 95) {
      checksum += val * (i + 1);
      result += CODE128_PATTERNS[val];
    }
  }

  const checkIndex = checksum % 103;
  result += CODE128_PATTERNS[checkIndex];
  result += CODE128_PATTERNS[106]; // Stop symbol

  return result;
}

interface TicketBarcodeProps {
  ticketId: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export default function TicketBarcode({
  ticketId,
  width = 230,
  height = 48,
  showText = true,
}: TicketBarcodeProps) {
  const pattern = encodeCode128B(ticketId);
  const totalUnits = pattern.split("").reduce((acc, char) => acc + parseInt(char, 10), 0);
  const unitWidth = width / totalUnits;

  let currentX = 0;
  const bars: { x: number; width: number; isBlack: boolean }[] = [];

  for (let i = 0; i < pattern.length; i++) {
    const w = parseInt(pattern[i], 10) * unitWidth;
    const isBlack = i % 2 === 0;
    bars.push({ x: currentX, width: w, isBlack });
    currentX += w;
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect width={width} height={height} fill="#ffffff" rx="4" />
        {bars.map((bar, idx) => (
          bar.isBlack ? (
            <rect
              key={idx}
              x={bar.x}
              y={4}
              width={bar.width}
              height={height - 8}
              fill="#000000"
            />
          ) : null
        ))}
      </svg>
      {showText && (
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
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
