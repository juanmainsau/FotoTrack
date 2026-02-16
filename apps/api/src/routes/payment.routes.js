import { Router } from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Protegemos la ruta: solo usuarios logueados pueden pagar
router.post("/create-order", authMiddleware, paymentController.createPreference);

export default router;