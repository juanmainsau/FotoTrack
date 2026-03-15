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
// Público o filtrado por estado en el controlador
router.get("/", albumController.getAll);

// 🔹 Obtener álbum por ID
router.get("/:id", albumController.getById);

// 🔹 Crear álbum básico (solo metadata)
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  albumController.create
);

// 🔥 CREACIÓN COMPLETA (metadata + imágenes + IA)
// Se usa al crear un álbum desde cero con fotos
router.post(
  "/complete",
  authMiddleware,
  requireAdmin,
  uploadMultipleImages,
  albumController.createComplete
);

// 📸 AÑADIR IMÁGENES A ÁLBUM EXISTENTE
// Esta es la ruta que llamó el Modal de Edición y daba 404
router.post(
  "/:id/images",
  authMiddleware,
  requireAdmin,
  uploadMultipleImages, // Procesa el array de archivos bajo el nombre "imagenes"
  albumController.addImagesToAlbum
);

// 🔹 Editar metadatos del álbum
router.put(
  "/:id",
  authMiddleware,
  requireAdmin,
  albumController.actualizar
);

// 🔹 Archivar álbum (Baja Lógica / Soft Delete)
// Cambia el estado a 'oculto' sin borrar fotos de Cloudinary/IA
router.delete(
  "/:id",
  authMiddleware,
  requireAdmin,
  albumController.eliminar
);

// Ruta para que el Admin fuerce el reconocimiento facial en un álbum viejo
router.post("/:id/reprocess", authMiddleware, albumController.reprocessAlbumIA);

export default router;