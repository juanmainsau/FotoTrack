// src/routes/album.routes.js
import { Router } from "express";
import { albumController } from "../controllers/album.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";
import { uploadMultipleImages } from "../middlewares/upload.middleware.js";

const router = Router();

// Obtener álbumes
router.get("/", albumController.getAll);

// Obtener álbum por ID
router.get("/:id", albumController.getById);

// Crear álbum básico
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  albumController.create
);

// Crear álbum completo con imágenes
router.post(
  "/complete",
  authMiddleware,
  requireAdmin,
  uploadMultipleImages,
  albumController.createComplete
);

// Añadir imágenes a álbum existente
router.post(
  "/:id/images",
  authMiddleware,
  requireAdmin,
  uploadMultipleImages,
  albumController.addImagesToAlbum
);

// Editar metadatos del álbum
router.put(
  "/:id",
  authMiddleware,
  requireAdmin,
  albumController.actualizar
);

// Baja lógica del álbum
router.delete(
  "/:id",
  authMiddleware,
  requireAdmin,
  albumController.eliminar
);

// Reprocesar reconocimiento facial del álbum
router.post(
  "/:id/reprocess",
  authMiddleware,
  requireAdmin,
  albumController.reprocessAlbumIA
);

export default router;