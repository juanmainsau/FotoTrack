import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paymentController } from "../controllers/payment.controller.js";
import { webhookController } from "../controllers/webhook.controller.js";
import { emailService } from "../services/email.service.js"; // 👈 Asegúrate de tener este import

const router = Router();

// --- RUTAS REALES ---
router.post("/create-order", authMiddleware, paymentController.createPreference);
router.post("/webhook", webhookController.receiveWebhook);

// --- 👇 RUTA DE PRUEBA (IMPORTANTE: Debe ser router.GET) ---
router.get("/test-email-simulado", async (req, res) => {
  try {
    console.log("🔥 EJECUTANDO PRUEBA DE EMAIL..."); // Esto saldrá en la terminal
    
    // Pon aquí TU correo real para probar
    const emailDestino = "juanmainsau@gmail.com"; 

    const itemsFalsos = [{ id: "TEST", title: "Foto de Prueba" }];

    const enviado = await emailService.sendPurchaseSuccess(
      emailDestino,
      "Tester Juan",
      "999999",
      itemsFalsos
    );

    if (enviado) res.send("<h1>✅ Correo enviado. ¡Revisa tu bandeja de entrada!</h1>");
    else res.status(500).send("<h1>❌ Falló el envío. Mira la consola (terminal).</h1>");

  } catch (error) {
    console.error(error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// 👇 ESTO DEBE SER LO ÚLTIMO DEL ARCHIVO
export default router;