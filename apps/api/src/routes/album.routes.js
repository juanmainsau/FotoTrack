// src/routes/album.routes.js
import { Router } from "express";
import { albumController } from "../controllers/album.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";
import { uploadMultipleImages } from "../middlewares/upload.middleware.js";

const router = Router();

// 🔓 Rutas públicas
router.get("/", albumController.getAll);
router.get("/:id", albumController.getById);

// 🔐 Rutas protegidas (solo admin)
router.post("/", authMiddleware, requireAdmin, albumController.create);
router.put("/:id", authMiddleware, requireAdmin, albumController.actualizar);
router.delete("/:id", authMiddleware, requireAdmin, albumController.eliminar);

// ⭐⭐⭐ NUEVA RUTA — Crear álbum completo con imágenes
router.post(
  "/complete",
  authMiddleware,
  requireAdmin,
  uploadMultipleImages,
  albumController.createComplete
);

export default router;
