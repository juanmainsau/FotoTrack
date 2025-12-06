// src/routes/images.routes.js
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";
import {
  uploadSingleImage,
  uploadMultipleImages,
} from "../middlewares/upload.middleware.js";
import { imageController } from "../controllers/image.controller.js";

const router = Router();

// ✔ Obtener imágenes de un álbum
router.get("/album/:idAlbum", imageController.getByAlbum);

// ✔ Subir imágenes para un nuevo álbum (CREACIÓN de álbum)
router.post(
  "/upload",
  authMiddleware,
  requireAdmin,
  uploadMultipleImages,
  imageController.uploadImages
);

// ✔ Subir UNA imagen (si en algún lado lo usás)
router.post(
  "/upload-one",
  authMiddleware,
  requireAdmin,
  uploadSingleImage,
  imageController.uploadImage
);

// ✔ Eliminar una imagen específica
router.delete(
  "/:idImagen",
  authMiddleware,
  requireAdmin,
  imageController.deleteImage
);

export default router;
