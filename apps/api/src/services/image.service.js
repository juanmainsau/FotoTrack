// src/services/image.service.js
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { imageRepository } from "../repositories/image.repository.js";

export const imageService = {
  async processAndSaveImage(idAlbum, archivo) {
    const originalPath = archivo.path;

    // Rutas finales
    const baseName = path.basename(originalPath);
    const procesadaPath = path.resolve("apps/api/src/uploads/procesadas", baseName);
    const miniaturaPath = path.resolve("apps/api/src/uploads/miniaturas", baseName);

    // Crear carpetas si no existen
    [procesadaPath, miniaturaPath].forEach((folder) => {
      const dir = path.dirname(folder);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Generar imagen procesada
    await sharp(originalPath)
      .resize(1600) // redimensionar para la web
      .toFile(procesadaPath);

    // Miniatura
    await sharp(originalPath)
      .resize(400)
      .toFile(miniaturaPath);

    // Guardar en DB
    const newImg = await imageRepository.create({
      idAlbum,
      nombreArchivo: baseName,
      rutaOriginal: `uploads/original/${baseName}`,
      rutaProcesada: `uploads/procesadas/${baseName}`,
      rutaMiniatura: `uploads/miniaturas/${baseName}`
    });

    return newImg;
  },

  async getImagesByAlbum(idAlbum) {
    return await imageRepository.getByAlbum(idAlbum);
  }
};
