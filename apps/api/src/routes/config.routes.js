// apps/api/src/routes/config.routes.js
import { Router } from "express";
// 👇 CAMBIO IMPORTANTE: Importamos el Controller, no el Service
import { configController } from "../controllers/config.controller.js"; 
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";

const router = Router();
// Configuración temporal de multer para subir la imagen antes de pasarla a Cloudinary
const upload = multer({ dest: "temp/" });

// 🔐 Obtener configuración (Delegamos directo al controlador)
router.get("/", authMiddleware, requireAdmin, configController.getConfig);

// 🔐 Guardar parámetros
router.put("/", authMiddleware, requireAdmin, configController.updateConfig);

// 🔐 Subir watermark (Multer procesa el archivo 'watermark' antes del controller)
router.post(
  "/watermark",
  authMiddleware,
  requireAdmin,
  upload.single("watermark"),
  configController.uploadWatermark
);

export default router;