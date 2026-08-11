import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { encodeCode128B } from "@/components/TicketBarcode";

export function generateTicketPDFBuffer(params: {
  toName: string;
  ticketId: string;
  tierName: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Header Top Bar
      doc.rect(40, 40, 515, 50).fill("#1c1a17");

      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor("#ffffff")
        .text("UNIVERSAL METHOD SEMINAR", 55, 50);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#0074d4")
        .text("CHRIS COLLINS • SEMINAR TICKET PASS", 55, 72);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#ffffff")
        .text("STAMPA @ CASA", 430, 58, { align: "right" });

      // Customer Order Details Card
      doc
        .rect(40, 105, 515, 80)
        .fillAndStroke("#f4f1e9", "#d8d2c4");

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#6b6459")
        .text("DATI PARTECIPANTE ED ORDINE", 55, 115);

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#1c1a17")
        .text(params.toName || "Partecipante Confermato", 55, 130);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#0074d4")
        .text(`Codice Pass: ${params.ticketId}`, 55, 150);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#1c1a17")
        .text(`Tipo Pass: ${params.tierName}`, 55, 165);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#6b6459")
        .text(`Data: ${new Date().toLocaleDateString("it-IT")}`, 380, 130, { align: "right" });

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#6b6459")
        .text("Pagamento: Stripe Verified", 380, 148, { align: "right" });

      // Official Ticket Card Box
      doc
        .rect(40, 200, 515, 220)
        .strokeColor("#1c1a17")
        .lineWidth(1.5)
        .stroke();

      // Ticket Card Header
      doc
        .rect(40, 200, 515, 28)
        .fill("#1c1a17");

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#ffffff")
        .text("2026 UNIVERSAL METHOD SEMINAR — PASS UFFICIALE INGRESSO", 55, 208);

      // Ticket Main Details
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor("#0074d4")
        .text(params.tierName, 55, 245);

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#1c1a17")
        .text("Luogo: Bracciano (RM), Italia — 7 & 8 Settembre 2026", 55, 270);

      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor("#6b6459")
        .text("Istruttore Principale: Chris Collins (BJJ Black Belt & Wing Tsun Sifu)", 55, 288);

      // Specs
      doc
        .moveTo(55, 310)
        .lineTo(535, 310)
        .strokeColor("#d8d2c4")
        .dash(3, { space: 3 })
        .stroke();

      doc.undash();

      doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b6459").text("LUOGO", 55, 322);
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#1c1a17").text("Bracciano (RM)", 55, 335);

      doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b6459").text("DATE", 195, 322);
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#1c1a17").text("7-8 Settembre 2026", 195, 335);

      doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b6459").text("TICKET ID", 345, 322);
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0074d4").text(params.ticketId, 345, 335);

      // Official Code 128 Barcode Vector Draw
      try {
        const pattern = encodeCode128B(params.ticketId);
        let bX = 345;
        const bY = 352;
        const bHeight = 36;
        const unitW = 1.25;

        for (let i = 0; i < pattern.length; i++) {
          const w = parseInt(pattern[i], 10) * unitW;
          if (i % 2 === 0) {
            doc.rect(bX, bY, w, bHeight).fill("#000000");
          }
          bX += w;
        }
      } catch (barcodeErr) {
        console.warn("Could not draw PDF barcode:", barcodeErr);
      }

      // Entry Instructions
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#1c1a17")
        .text("ISTRUZIONI PER L'ACCESSO AL SEMINARIO", 40, 445);

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor("#3a352e")
        .text("1. Presenta questo biglietto PDF all'ingresso (stampato oppure dallo smartphone).", 40, 465)
        .text("2. Tieni a portata di mano un documento d'identità valido per il check-in.", 40, 483)
        .text("3. Presentati al check-in almeno 15 minuti prima dell'inizio delle sessioni.", 40, 501);

      // Footer
      doc
        .moveTo(40, 760)
        .lineTo(555, 760)
        .strokeColor("#1c1a17")
        .lineWidth(1)
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor("#1c1a17")
        .text("Universal Method Seminar — Chris Collins", 40, 770);

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor("#6b6459")
        .text("Pass Confermato • Pagina 1 / 1", 440, 770, { align: "right" });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

export async function sendConfirmationEmailAsync(params: {
  toEmail: string;
  toName: string;
  ticketId: string;
  tierName: string;
  pdfBase64?: string;
}) {
  const { toEmail, toName, ticketId, tierName, pdfBase64 } = params;

  if (!toEmail) return false;

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.log(
      `[EMAIL NOTICE] SMTP credentials not set in .env.local (SMTP_USER / SMTP_PASS). Confirmation email for Ticket ${ticketId} simulated for ${toEmail}.`
    );
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f7; color: #111; padding: 20px; margin: 0; }
          .card { max-width: 550px; margin: 0 auto; background: #ffffff; border: 1px solid #e1e1e6; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { border-bottom: 2px solid #0074d4; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
          .gold-title { font-size: 20px; font-weight: bold; color: #0074d4; text-transform: uppercase; margin: 0; }
          .ticket-id { font-family: monospace; font-size: 14px; color: #0074d4; font-weight: bold; margin-top: 6px; }
          .box { background: #f9f9fc; border: 1px solid #e8e8ed; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
          .footer { font-size: 12px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="gold-title">UNIVERSAL METHOD SEMINAR</h1>
            <div class="ticket-id">PASS ID: ${ticketId}</div>
          </div>
          <p>Ciao <strong>${toName || "Partecipante"}</strong>,</p>
          <p>Grazie per esserti iscritto al <strong>Universal Method Seminar con Chris Collins</strong>! La tua iscrizione è stata confermata con successo.</p>

          <div class="box">
            <div class="row"><span><strong>Tipo di Pass:</strong></span> <span>${tierName}</span></div>
            <div class="row"><span><strong>Date & Orari:</strong></span> <span>7 & 8 Settembre 2026</span></div>
            <div class="row"><span><strong>Luogo:</strong></span> <span>Bracciano (RM), Italia</span></div>
            <div class="row"><span><strong>Istruttore:</strong></span> <span>Chris Collins (BJJ Black Belt & Wing Tsun Sifu)</span></div>
          </div>

          <p>📎 In allegato a questa email trovi il tuo <strong>Biglietto di Ingresso Ufficiale in formato PDF</strong>.</p>
          <p>Puoi stampare il biglietto PDF allegato oppure mostrarlo direttamente dal cellulare all'ingresso.</p>

          <div class="footer">
            Universal Method Seminar 2026 • Tutti i diritti riservati.
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments: any[] = [];
    if (pdfBase64) {
      attachments.push({
        filename: `Biglietto_Ingresso_UMS_${ticketId}.pdf`,
        content: Buffer.from(pdfBase64, "base64"),
        contentType: "application/pdf",
      });
    } else {
      try {
        const autoPdfBuffer = await generateTicketPDFBuffer({ toName, ticketId, tierName });
        attachments.push({
          filename: `Biglietto_Ingresso_UMS_${ticketId}.pdf`,
          content: autoPdfBuffer,
          contentType: "application/pdf",
        });
      } catch (pdfErr) {
        console.warn("Could not generate automatic PDF attachment buffer:", pdfErr);
      }
    }

    const cleanFrom = process.env.EMAIL_FROM
      ? process.env.EMAIL_FROM.replace(/^"/, "").replace(/"$/, "")
      : `"Universal Method Seminar" <${smtpUser}>`;

    await transporter.sendMail({
      from: cleanFrom,
      to: toEmail,
      subject: `🎉 Pass Confermato (${ticketId}) — Universal Method Seminar Chris Collins`,
      html: htmlBody,
      attachments,
    });

    console.log(`[EMAIL DELIVERED] Confirmation email sent to ${toEmail} with PDF attachment!`);
    return true;
  } catch (err) {
    console.error("Error sending confirmation email:", err);
    return false;
  }
}
