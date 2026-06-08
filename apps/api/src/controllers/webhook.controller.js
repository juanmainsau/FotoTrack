// src/controllers/webhook.controller.js
import { MercadoPagoConfig, Payment } from "mercadopago";
import { emailService } from "../services/email.service.js";
import { purchaseService } from "../services/purchase.service.js";
import { db } from "../config/db.js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export const webhookController = {
  async receiveWebhook(req, res) {
    try {
      const { query, body } = req;

      console.log("🔔 WEBHOOK IMPACTANDO...");
      console.log("Query:", query);
      console.log("Body:", body);

      const topic = query.topic || query.type || body?.type;
      const paymentId = query.id || query["data.id"] || body?.data?.id;

      if (topic !== "payment" || !paymentId) {
        console.log("ℹ️ Webhook ignorado: no es pago o no hay paymentId.");
        return res.sendStatus(200);
      }

      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      const { status, metadata, additional_info } = paymentData;

      console.log(
        `💳 Pago ${paymentId} | Estado: ${status} | Usuario: ${metadata?.user_id}`
      );

      if (status !== "approved") {
        console.log(`ℹ️ Pago no aprobado todavía: ${status}`);
        return res.sendStatus(200);
      }

      if (!metadata?.user_id || !metadata?.carrito_id || !metadata?.email) {
        console.error("❌ Metadata incompleta:", metadata);
        return res.sendStatus(200);
      }

      const [compraPrevia] = await db.query(
        `
        SELECT idCompra
        FROM compras
        WHERE idTransaccionMP = ?
        LIMIT 1
        `,
        [String(paymentId)]
      );

      if (compraPrevia.length > 0) {
        console.log(
          `⚠️ Compra MP ${paymentId} ya registrada como compra interna ${compraPrevia[0].idCompra}. Webhook duplicado ignorado.`
        );
        return res.sendStatus(200);
      }

      const resultBD = await purchaseService.createPurchase({
        idUsuario: Number(metadata.user_id),
        idCarrito: Number(metadata.carrito_id),
        idMetodoPago: 1,
        idTransaccionMP: String(paymentId),
      });

      if (!resultBD.ok) {
        if (
          String(resultBD.error || "")
            .toLowerCase()
            .includes("duplicate entry")
        ) {
          console.log(
            `⚠️ Webhook duplicado ignorado por clave única MP: ${paymentId}`
          );
          return res.sendStatus(200);
        }

        console.error("❌ Error guardando compra:", resultBD.error);
        return res.sendStatus(200);
      }

      console.log(`💾 Compra interna ${resultBD.idCompra} registrada.`);

      const itemsComprados = additional_info?.items || [];

      const enviado = await emailService.sendPurchaseSuccess(
        metadata.email,
        "Cliente FotoTrack",
        String(paymentId),
        itemsComprados
      );

      if (enviado) {
        console.log("🚀 Correo de compra enviado.");
      } else {
        console.warn("⚠️ No se pudo enviar el correo de compra.");
      }

      return res.sendStatus(200);
    } catch (error) {
      if (error?.code === "ER_DUP_ENTRY") {
        console.log("⚠️ Webhook duplicado ignorado por ER_DUP_ENTRY.");
        return res.sendStatus(200);
      }

      console.error("❌ CRASH EN WEBHOOK:", error);
      return res.sendStatus(200);
    }
  },
};