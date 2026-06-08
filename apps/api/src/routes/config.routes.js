// src/routes/config.routes.js
import { Router } from "express";
import multer from "multer";

import { configController } from "../controllers/config.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";

const router = Router();

const upload = multer({
  dest: "temp/",
});

// GET: configuración general
router.get("/", authMiddleware, configController.getConfig);

// GET: precios globales
router.get("/prices", authMiddleware, configController.getGlobalPrices);

// PUT: actualizar configuración
router.put("/", authMiddleware, requireAdmin, configController.updateConfig);

// POST: subir marca de agua
router.post(
  "/watermark",
  authMiddleware,
  requireAdmin,
  upload.single("watermark"),
  configController.uploadWatermark
);

export default router;