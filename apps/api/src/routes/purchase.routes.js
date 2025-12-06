import { Router } from "express";
import { purchaseController } from "../controllers/purchase.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, purchaseController.create);
router.get("/mias", authMiddleware, purchaseController.getMyPurchases);

// ⭐ NUEVA RUTA: descargar ZIP de imágenes
router.get("/:idCompra/descargar", authMiddleware, purchaseController.download);

export default router;
