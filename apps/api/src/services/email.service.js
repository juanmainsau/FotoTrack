import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// Configuración del transporte (Gmail)
// Asegúrate de tener EMAIL_USER y EMAIL_PASS en tu .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const emailService = {
  /**
   * Envía el correo de éxito al usuario con el link de descarga seguro.
   */
  async sendPurchaseSuccess(toEmail, userName, orderId, items) {
    try {
      console.log(`📧 Preparando correo para: ${toEmail}`);

      // 1. Generamos un token que expira en 7 días para proteger la descarga
      const downloadToken = jwt.sign(
        { compraId: orderId, email: toEmail },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 2. Construimos el LINK PÚBLICO (pero seguro)
      // Este link apunta a una ruta de tu backend que crearemos luego
      // Asegúrate de que el puerto (4000) sea el correcto de tu API
      const downloadLink = `http://localhost:4000/api/compras/public/download/${orderId}?token=${downloadToken}`;

      // 3. Generamos la lista de items para el HTML
      const itemsHtml = items.map(item => `
        <li style="margin-bottom: 5px; color: #555;">
          Foto #${item.id} - ${item.title || "Foto sin título"}
        </li>
      `).join('');

      // 4. Enviamos el correo
      const info = await transporter.sendMail({
        from: '"FotoTrack 📸" <no-reply@fototrack.com>',
        to: toEmail,
        subject: `¡Tu compra #${orderId} está lista! 🎉`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            
            <div style="background-color: #2563eb; padding: 25px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">¡Gracias por tu compra!</h1>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #333;">Hola <strong>${userName}</strong>,</p>
              <p style="color: #666; line-height: 1.5;">
                Tu pago se ha acreditado correctamente. Ya hemos preparado tu paquete de fotos en alta calidad.
              </p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">📦 Resumen del pedido #${orderId}</h3>
                <ul style="padding-left: 20px; margin-bottom: 0;">
                  ${itemsHtml}
                </ul>
              </div>

              <div style="text-align: center; margin-top: 40px; margin-bottom: 40px;">
                <a href="${downloadLink}" style="background-color: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
                  ⬇️ DESCARGAR MIS FOTOS (ZIP)
                </a>
              </div>

              <p style="font-size: 13px; color: #94a3b8; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                Este enlace de descarga es válido por 7 días por seguridad.<br>
                Si tienes algún problema, responde a este correo.
              </p>
            </div>
          </div>
        `,
      });

      console.log("📨 Correo enviado correctamente. ID: %s", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Error enviando correo:", error);
      return false;
    }
  },
};