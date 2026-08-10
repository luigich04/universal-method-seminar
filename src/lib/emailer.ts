import nodemailer from "nodemailer";

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
