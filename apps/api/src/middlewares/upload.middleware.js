// apps/api/src/middlewares/upload.middleware.js
import multer from "multer";
import path from "path";
import os from "os";
import fs from "fs"; // 👈 NUEVO: Necesario para crear la carpeta local

// =========================================================
// 1️⃣ CONFIGURACIÓN ORIGINAL (Para Álbumes / Cloudinary)
// =========================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usamos la carpeta temporal del sistema operativo
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Formato de archivo no soportado. Solo imágenes."), false);
  }
};

const multerConfig = {
  storage: storage,
  fileFilter: fileFilter,
};

// 🔹 Subida de una sola imagen a Temp (ej: Cloudinary)
export const uploadSingleImage = multer(multerConfig).single("image");

// 🔹 Subida de múltiples imágenes a Temp (ej: Álbum)
export const uploadMultipleImages = multer(multerConfig).array("images", 200);


// =========================================================
// 2️⃣ NUEVA CONFIGURACIÓN LOCAL (Específica para Selfies)
// =========================================================
const localSelfieDir = path.join(process.cwd(), 'uploads/selfies');

// Si la carpeta no existe, la creamos
if (!fs.existsSync(localSelfieDir)) {
  fs.mkdirSync(localSelfieDir, { recursive: true });
}

const selfieStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localSelfieDir); // Aquí obligamos a que se guarde en nuestra carpeta pública
  },
  filename: (req, file, cb) => {
    const userId = req.user?.idUsuario || req.user?.id || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `selfie_${userId}_${Date.now()}${ext}`);
  }
});

// 🔹 EXPORTAMOS EL MIDDLEWARE QUE BUSCA LAS RUTAS
export const uploadSelfie = multer({ 
  storage: selfieStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite 5MB
  fileFilter: fileFilter
});