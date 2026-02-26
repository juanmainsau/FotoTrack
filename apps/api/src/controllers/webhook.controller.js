import { MercadoPagoConfig, Payment } from 'mercadopago';
import { emailService } from '../services/email.service.js';
import { purchaseService } from '../services/purchase.service.js';
import { db } from '../config/db.js';

// Inicializamos el cliente de MP
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

export const webhookController = {
  async receiveWebhook(req, res) {
    try {
      // 1. LOG INICIAL: Ver qué llega exactamente
      const { query, body } = req;
      console.log("🔔 WEBHOOK IMPACTANDO...");
      console.log("Que llega en Query:", query);
      console.log("Que llega en Body:", body);

      // 2. Extraer ID y Topic con todas las variantes posibles
      const topic = query.topic || query.type || body?.type; 
      const paymentId = query.id || query['data.id'] || body?.data?.id;

      console.log(`🔎 Interpretado -> Topic: ${topic} | Payment ID: ${paymentId}`);

      // Solo nos interesa si es un pago ('payment') y tenemos ID
      if (topic === 'payment' && paymentId) {
        
        console.log(`⏳ Consultando estado del pago ${paymentId} a Mercado Pago...`);
        
        // 3. Consultamos la API de MP para ver el estado real
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });
        
        // Extraemos todo lo que necesitamos, incluyendo el monto total
        const { status, status_detail, metadata, additional_info, transaction_amount } = paymentData;

        console.log(`💳 Estado: ${status.toUpperCase()} | Email en Metadata: ${metadata?.email || 'NO ENCONTRADO'}`);

        // 4. Si está aprobado, procedemos con BD y Correo
        if (status === 'approved') {
          console.log("✅ PAGO APROBADO. Registrando y enviando correo...");

          if (!metadata?.email || !metadata?.user_id) {
            console.error("❌ ERROR: Faltan datos en metadata (email o user_id).");
            return res.sendStatus(200); 
          }

          // Recuperamos los items comprados
          const itemsComprados = additional_info?.items || [];
          
          // ==========================================
          // 💾 MAGIA DE LA BASE DE DATOS
          // ==========================================
          try {
             // 👇 FRENO ANTI-DUPLICADOS: Revisamos si ya existe
             const [compraPrevia] = await db.query("SELECT idCompra FROM compras WHERE idTransaccionMP = ?", [paymentId]);
             
             if (compraPrevia.length > 0) {
                 console.log(`⚠️ La compra ${paymentId} ya estaba registrada. Ignorando duplicado de MP.`);
                 return res.sendStatus(200); 
             }

             if (!metadata?.carrito_id) {
                 console.warn("⚠️ Advertencia: No vino carrito_id en la metadata. El carrito podría no vaciarse.");
             }

             const resultBD = await purchaseService.createPurchase({
                idUsuario: metadata.user_id,
                idCarrito: metadata.carrito_id, 
                idMetodoPago: 1 
             });

             if (resultBD.ok) {
                // 👇 ESTA ES LA PIEZA FALTANTE: Enlazamos el ID de MP a tu tabla para que el Zip funcione
                await db.query(
                  "UPDATE compras SET idTransaccionMP = ?, estadoPago = 'approved' WHERE idCompra = ?", 
                  [paymentId, resultBD.idCompra]
                );
                console.log(`💾 ¡ÉXITO! Compra ${resultBD.idCompra} guardada y enlazada con MP ID: ${paymentId}`);
             } else {
                console.error(`❌ Error interno guardando la compra: ${resultBD.error}`);
             }

          } catch (dbError) {
            console.error("❌ Excepción no controlada al guardar en BD:", dbError);
          }
          // ==========================================

          console.log(`📧 Enviando email a: ${metadata.email} con ${itemsComprados.length} items.`);

          // Llamada al servicio de email
          const enviado = await emailService.sendPurchaseSuccess(
            metadata.email,       // Email
            "Cliente FotoTrack",  // Nombre
            String(paymentId),    // ID Compra de MP
            itemsComprados        // Items
          );

          if (enviado) {
            console.log("🚀 ¡CORREO ENVIADO CON ÉXITO!");
          } else {
            console.error("⚠️ El servicio de email devolvió false.");
          }
        } else {
          console.log(`ℹ️ El pago no está aprobado todavía (Estado: ${status}).`);
        }
      } else {
        console.log("ignorado: No es una notificación de pago (payment).");
      }

      res.sendStatus(200);

    } catch (error) {
      console.error("❌ CRASH EN WEBHOOK:", error);
      res.sendStatus(200); 
    }
  }
};