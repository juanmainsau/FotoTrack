// src/services/whatsapp.service.js
import twilio from "twilio";

const enabled = process.env.WHATSAPP_NOTIFICATIONS_ENABLED === "true";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM;

const client =
  accountSid && authToken
    ? twilio(accountSid, authToken)
    : null;

function normalizePhone(phone) {
  if (!phone) return null;

  let clean = String(phone).trim();

  if (!clean.startsWith("+")) {
    clean = clean.replace(/\D/g, "");

    if (clean.startsWith("0")) {
      clean = clean.slice(1);
    }

    if (!clean.startsWith("54")) {
      clean = `54${clean}`;
    }

    clean = `+${clean}`;
  }

  return `whatsapp:${clean}`;
}

export const whatsappService = {
  async sendFaceDetectedNotification({ telefono, nombre, album, idImagen }) {
    try {
      if (!enabled) {
        console.log("📲 WhatsApp desactivado por configuración.");
        return false;
      }

      if (!client || !from) {
        console.warn("⚠️ Twilio no está configurado correctamente.");
        return false;
      }

      const to = normalizePhone(telefono);

      if (!to) {
        console.warn("⚠️ Usuario sin teléfono para WhatsApp.");
        return false;
      }

      const body = `📸 Hola ${nombre || "corredor"}! FotoTrack encontró una nueva foto donde aparecés${album ? ` en el álbum "${album}"` : ""}. Ingresá al sistema para verla. Foto #${idImagen}`;

      const message = await client.messages.create({
        from,
        to,
        body,
      });

      console.log("📲 WhatsApp enviado correctamente:", message.sid);
      return true;
    } catch (error) {
      console.error("❌ Error enviando WhatsApp:", error.message);
      return false;
    }
  },
};