import { Router } from "express";
import { configController } from "../controllers/config.controller.js"; 
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";

const router = Router();
const upload = multer({ dest: "temp/" });

// 🟢 GET: Datos generales (Vendedor, etc)
router.get("/", authMiddleware, configController.getConfig);

// 💰 GET: Solo precios (Para el flujo de creación de álbumes)
router.get("/prices", authMiddleware, configController.getGlobalPrices);

// 🔴 PUT: Escritura - SOLO Administradores
router.put("/", authMiddleware, requireAdmin, configController.updateConfig);

// 🔴 POST: Subir watermark - SOLO Administradores
router.post(
  "/watermark",
  authMiddleware,
  requireAdmin,
  upload.single("watermark"),
  configController.uploadWatermark
);

export default router;