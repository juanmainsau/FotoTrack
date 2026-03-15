// apps/api/src/middlewares/upload.middleware.js
import multer from "multer";
import path from "path";
import os from "os";
import fs from "fs";

// 1️⃣ Configuración para Álbumes (Cloudinary / IA)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
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

const multerConfig = { storage, fileFilter };

export const uploadSingleImage = multer(multerConfig).single("imagen");

// 📸 IMPORTANTE: "imagenes" para que coincida con el modal de edición
export const uploadMultipleImages = multer(multerConfig).array("images", 200);


// 2️⃣ Configuración local para Selfies
const localSelfieDir = path.join(process.cwd(), 'uploads/selfies');

if (!fs.existsSync(localSelfieDir)) {
  fs.mkdirSync(localSelfieDir, { recursive: true });
}

const selfieStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localSelfieDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.idUsuario || req.user?.id || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `selfie_${userId}_${Date.now()}${ext}`);
  }
});

// Exportamos la instancia de multer para selfies (sin el .single)
export const uploadSelfie = multer({ 
  storage: selfieStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});