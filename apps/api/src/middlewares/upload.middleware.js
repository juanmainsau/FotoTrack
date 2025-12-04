// src/middlewares/upload.middleware.js
import multer from "multer";
import path from "path";
import os from "os";

// Guardar archivos temporalmente en carpeta del sistema
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // carpeta temporal del sistema operativo
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

// Configuración común (20 MB por archivo)
const multerConfig = {
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
};

// 🔹 Para endpoints que suben UNA sola imagen (lo que ya tenías)
export const uploadSingleImage = multer(multerConfig).single("imagen");

// 🔹 Para el nuevo flujo de crear álbum completo (MÚLTIPLES imágenes)
// El nombre del campo debe coincidir con formData.append("imagenes", file)
export const uploadMultipleImages = multer(multerConfig).array(
  "imagenes",
  200 // por ejemplo, máximo 200 archivos en una sola request
);
