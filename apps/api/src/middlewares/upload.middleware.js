// src/middlewares/upload.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve("apps/api/src/uploads/original");

    // Crear carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);

    cb(null, unique + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Aceptamos solo imágenes
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Solo se permiten imágenes."));
  }
  cb(null, true);
};

export const uploadSingleImage = multer({
  storage,
  fileFilter
}).single("imagen");
