// src/services/image.service.js
import fs from "fs";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";
import { imageRepository } from "../repositories/image.repository.js";

export const imageService = {
  // ---------------------------------------------------------
  // Obtener imágenes por álbum
  // ---------------------------------------------------------
  async getImagesByAlbum(idAlbum) {
    return await imageRepository.getByAlbum(idAlbum);
  },

  // ---------------------------------------------------------
  // Subida de múltiples imágenes (crear álbum)
  // ---------------------------------------------------------
  async processAndSaveImages(files) {
    const processed = [];
    for (const file of files) {
      const img = await this.processSingleImage(file, null);
      processed.push(img);
    }
    return processed;
  },

  // ---------------------------------------------------------
  // Agregar imágenes a un álbum existente
  // ---------------------------------------------------------
  async addImagesToAlbum(idAlbum, files) {
    const results = [];
    for (const file of files) {
      const img = await this.processSingleImage(file, idAlbum);
      results.push(img);
    }
    return results;
  },

  // ---------------------------------------------------------
  // ⭐ FUNCIÓN CENTRAL — Procesar 1 imagen
  // (miniatura, optimizada y original)
  // ---------------------------------------------------------
  async processSingleImage(file, idAlbum = null) {
    // Validaciones críticas
    if (!file) {
      console.error("❌ imageService: file es null o undefined:", file);
      throw new Error("Archivo de imagen no válido.");
    }

    if (!file.path) {
      console.error("❌ imageService: file.path no existe:", file);
      throw new Error("Ruta del archivo temporal no encontrada.");
    }

    const tempPath = file.path;

    // ======================================================
    // 1) Leer archivo y generar buffer de forma segura
    // ======================================================
    let originalBuffer;
    try {
      originalBuffer = await sharp(tempPath).toFormat("jpeg").jpeg({ quality: 90 }).toBuffer();
    } catch (err) {
      console.error("❌ Error leyendo imagen con Sharp:", err);
      throw new Error("La imagen está corrupta o no es un formato válido.");
    }

    // ======================================================
    // 2) Subir ORIGINAL a Cloudinary
    // ======================================================
    const originalUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `fototrack/albums/${idAlbum || "temp"}`,
          resource_type: "image",
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(originalBuffer);
    });

    // ======================================================
    // 3) Miniatura
    // ======================================================
    const thumbBuffer = await sharp(originalBuffer)
      .resize(350, 350, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `fototrack/albums/${idAlbum || "temp"}/thumb`,
          resource_type: "image",
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(thumbBuffer);
    });

    // ======================================================
    // 4) Imagen optimizada
    // ======================================================
    const optimizedBuffer = await sharp(originalBuffer)
      .jpeg({ quality: 85 })
      .toBuffer();

    const optimizedUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `fototrack/albums/${idAlbum || "temp"}/optimized`,
          resource_type: "image",
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(optimizedBuffer);
    });

    // ======================================================
    // 5) Guardar en BD
    // ======================================================
    const saved = await imageRepository.create({
      idAlbum,
      rutaOriginal: originalUpload.secure_url,
      rutaMiniatura: thumbUpload.secure_url,
      rutaOptimizado: optimizedUpload.secure_url,
      public_id: originalUpload.public_id,
    });

    // ======================================================
    // 6) Borrar archivo temporal
    // ======================================================
    try {
      fs.unlink(tempPath, () => {});
    } catch (err) {
      console.warn("⚠ No se pudo borrar archivo temporal:", tempPath);
    }

    return saved;
  },

  // ---------------------------------------------------------
  // Eliminar imagen
  // ---------------------------------------------------------
  async deleteImage(idImagen) {
    const img = await imageRepository.getImageById(idImagen);

    if (!img) throw new Error("Imagen no encontrada");

    try {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    } catch (err) {
      console.warn("⚠ No se pudo eliminar en Cloudinary:", err.message);
    }

    await imageRepository.deleteImageById(idImagen);
    return true;
  },
};
