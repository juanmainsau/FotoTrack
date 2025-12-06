// src/middlewares/upload.middleware.js
import multer from "multer";
import path from "path";
import os from "os";

// -------------------------------
// CONFIGURACIÓN DE DISK STORAGE
// -------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir()); // carpeta temporal del sistema
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

// -------------------------------
// CONFIGURACIÓN DE MULTER
// SIN LÍMITE DE TAMAÑO DE ARCHIVO
// -------------------------------
const multerConfig = {
  storage,
  // ❌ Eliminado: limits.fileSize
  // Con esto multer NO restringe el tamaño de cada archivo.
};

// -------------------------------
// EXPORTS
// -------------------------------

// 🔹 Subida de una sola imagen
export const uploadSingleImage = multer(multerConfig).single("imagen");

// 🔹 Subida de múltiples imágenes (crear álbum y editor)
export const uploadMultipleImages = multer(multerConfig).array(
  "imagenes",
  200 // máximo 200 archivos por request
);
