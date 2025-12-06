// src/routes/album.routes.js
import { Router } from "express";
import { albumController } from "../controllers/album.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";
import {
  uploadMultipleImages,
} from "../middlewares/upload.middleware.js";

const router = Router();

// 🔹 Obtener todos los álbumes
router.get("/", albumController.getAll);

// 🔹 Obtener álbum por ID
router.get("/:id", albumController.getById);

// 🔹 Crear álbum (sin imágenes)
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  albumController.create
);

// 🔥 CREACIÓN COMPLETA (metadata + imágenes)
router.post(
  "/complete",
  authMiddleware,
  requireAdmin,
  uploadMultipleImages,   // ⬅️ OBLIGATORIO
  albumController.createComplete
);

// 🔹 Editar álbum
router.put(
  "/:id",
  authMiddleware,
  requireAdmin,
  albumController.actualizar
);

// 🔹 Archivar álbum (soft delete)
router.delete(
  "/:id",
  authMiddleware,
  requireAdmin,
  albumController.eliminar
);

export default router;
