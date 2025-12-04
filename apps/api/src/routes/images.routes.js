// src/routes/images.routes.js
import { Router } from "express";
import { imageController } from "../controllers/image.controller.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";

const router = Router();

// Subir imagen
router.post(
  "/upload",
  authMiddleware,
  requireAdmin,
  uploadSingleImage,
  imageController.upload
);

// Obtener imágenes por álbum
router.get("/album/:idAlbum", imageController.getByAlbum);

// 💥 Eliminar imagen
router.delete(
  "/:idImagen",
  authMiddleware,
  requireAdmin,
  imageController.delete
);

export default router;
