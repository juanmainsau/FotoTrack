import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paymentController } from "../controllers/payment.controller.js";
import { webhookController } from "../controllers/webhook.controller.js";
import { emailService } from "../services/email.service.js";

const router = Router();

router.post("/create-order", authMiddleware, paymentController.createPreference);
router.post("/webhook", webhookController.receiveWebhook);

router.get("/test-email-simulado", async (req, res) => {
  try {
    console.log("🔥 EJECUTANDO PRUEBA DE EMAIL...");

    const emailDestino = "juanmainsau@gmail.com";
    const itemsFalsos = [{ id: "TEST", title: "Foto de Prueba" }];

    const enviado = await emailService.sendPurchaseSuccess(
      emailDestino,
      "Tester Juan",
      "999999",
      itemsFalsos
    );

    if (enviado) {
      return res.send("<h1>✅ Correo enviado. Revisá tu bandeja de entrada.</h1>");
    }

    return res.status(500).send("<h1>❌ Falló el envío. Revisá la consola.</h1>");
  } catch (error) {
    console.error("❌ Error en test-email-simulado:", error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

export default router;