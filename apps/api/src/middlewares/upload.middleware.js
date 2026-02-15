// apps/api/src/middlewares/upload.middleware.js
import multer from "multer";
import path from "path";
import os from "os";

// -------------------------------
// CONFIGURACIÓN DE DISK STORAGE
// -------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usamos la carpeta temporal del sistema operativo (más rápido y seguro)
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    // Generamos nombre único para evitar colisiones
    const unique = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

// -------------------------------
// FILTRO DE ARCHIVOS (Solo Imágenes)
// -------------------------------
const fileFilter = (req, file, cb) => {
  // Aceptamos jpg, jpeg, png, webp, gif
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Formato de archivo no soportado. Solo imágenes."), false);
  }
};

// -------------------------------
// CONFIGURACIÓN DE MULTER
// -------------------------------
const multerConfig = {
  storage: storage,
  fileFilter: fileFilter,
  // Sin límite de tamaño de archivo (o puedes descomentar abajo para poner uno)
  // limits: { fileSize: 10 * 1024 * 1024 }, // Ejemplo: 10MB
};

// -------------------------------
// EXPORTS
// -------------------------------

// 🔹 Subida de una sola imagen (ej: Selfie)
// ⚠️ IMPORTANTE: En el Frontend/Postman el campo debe llamarse "image"
export const uploadSingleImage = multer(multerConfig).single("image");

// 🔹 Subida de múltiples imágenes (ej: Álbum)
// ⚠️ IMPORTANTE: En el Frontend/Postman el campo debe llamarse "images"
export const uploadMultipleImages = multer(multerConfig).array(
  "images", 
  200 // Máximo 200 archivos por subida
);