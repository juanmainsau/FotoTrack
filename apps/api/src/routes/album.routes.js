import { Router } from "express";
import {
  obtenerAlbums,
  crearAlbum,
  uploadAlbumImages,
} from "../controllers/album.controller.js";

import { uploadImages } from "../middlewares/upload.middleware.js";

const router = Router();

// Crear álbum
router.post("/", crearAlbum);

// Listar álbumes
router.get("/", obtenerAlbums);

// Subir imágenes al álbum
router.post("/:id/upload", uploadImages.array("imagenes", 50), uploadAlbumImages);

export default router;
