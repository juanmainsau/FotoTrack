// src/services/email.service.js
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function getApiBaseUrl() {
  return process.env.API_PUBLIC_URL || "http://localhost:4000";
}

function sanitizeText(value) {
  return String(value || "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const emailService = {
  async sendPurchaseSuccess(toEmail, userName, orderId, items = []) {
    try {
      console.log(`📧 Preparando correo para: ${toEmail}`);

      const downloadToken = jwt.sign(
        {
          compraId: String(orderId),
          email: toEmail,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const baseUrl = getApiBaseUrl();

      const downloadLink = `${baseUrl}/api/compras/public/download/${orderId}?token=${downloadToken}`;

      const safeUserName = sanitizeText(userName || "Cliente FotoTrack");

      const itemsHtml =
        Array.isArray(items) && items.length > 0
          ? items
              .map((item, index) => {
                const id = sanitizeText(item.id || item.idImagen || index + 1);
                const title = sanitizeText(
                  item.title || item.nombreProducto || "Foto adquirida"
                );

                return `
                  <li style="margin-bottom: 5px; color: #555;">
                    Foto #${id} - ${title}
                  </li>
                `;
              })
              .join("")
          : `
            <li style="margin-bottom: 5px; color: #555;">
              Paquete de fotos adquirido en FotoTrack
            </li>
          `;

      const info = await transporter.sendMail({
        from: `"FotoTrack 📸" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `¡Tu compra #${orderId} está lista! 🎉`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 25px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">¡Gracias por tu compra!</h1>
            </div>

            <div style="padding: 30px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #333;">Hola <strong>${safeUserName}</strong>,</p>

              <p style="color: #666; line-height: 1.5;">
                Tu pago se acreditó correctamente. Ya preparamos tus fotos en alta calidad para descargar.
              </p>

              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">
                  📦 Resumen del pedido #${sanitizeText(orderId)}
                </h3>

                <ul style="padding-left: 20px; margin-bottom: 0;">
                  ${itemsHtml}
                </ul>
              </div>

              <div style="text-align: center; margin-top: 40px; margin-bottom: 40px;">
                <a href="${downloadLink}" style="background-color: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
                  ⬇️ DESCARGAR MIS FOTOS
                </a>
              </div>

              <p style="font-size: 13px; color: #94a3b8; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                Este enlace de descarga es válido por 7 días por seguridad.<br>
                Si tenés algún problema, respondé a este correo.
              </p>
            </div>
          </div>
        `,
      });

      console.log("📨 Correo enviado correctamente. ID:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Error enviando correo:", error);
      return false;
    }
  },
};