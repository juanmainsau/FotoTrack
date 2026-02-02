// src/services/image.service.js
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { imageRepository } from "../repositories/image.repository.js";
import { configRepository } from "../repositories/config.repository.js";

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
  // ⭐ FUNCIÓN CENTRAL — Procesar 1 imagen (Versión Cloudinary)
  // ---------------------------------------------------------
  async processSingleImage(file, idAlbum = null) {
    // Validaciones críticas
    if (!file || !file.path) {
      console.error("❌ imageService: archivo inválido", file);
      throw new Error("Archivo de imagen no válido.");
    }
    
    const tempPath = file.path;

    // 1. Obtener configuración de la BD (para saber si hay marca de agua activa)
    const config = await configRepository.getConfig();
    
    // Cloudinary necesita que los "/" del ID de la imagen overlay sean ":"
    let watermarkId = null;
    if (config && config.watermark_enabled && config.watermark_public_id) {
        watermarkId = config.watermark_public_id.replace(/\//g, ":");
    }

    try {
      // ======================================================
      // A. SUBIR ORIGINAL (Calidad máxima)
      // ======================================================
      const originalUpload = await cloudinary.uploader.upload(tempPath, {
        folder: `fototrack/albums/${idAlbum || "temp"}`,
        resource_type: "image",
      });

      // ======================================================
      // B. SUBIR MINIATURA (Thumb 350x350)
      // ======================================================
      // Dejamos que Cloudinary haga el resize aquí
      const thumbUpload = await cloudinary.uploader.upload(tempPath, {
        folder: `fototrack/albums/${idAlbum || "temp"}/thumb`,
        resource_type: "image",
        transformation: [{ width: 350, height: 350, crop: "fill", quality: "auto" }]
      });

      // ======================================================
      // C. SUBIR OPTIMIZADA CON MARCA DE AGUA
      // ======================================================
      const transformationOptions = [
        { width: 1200, crop: "limit" }, // No más de 1200px de ancho
        { quality: 80 }                 // Calidad web
      ];

      // Si hay marca de agua configurada, la agregamos como capa (overlay)
      if (watermarkId) {
        transformationOptions.push({
          overlay: watermarkId,
          gravity: config.watermark_position || "southeast", // Posición
          width: "0.3",              // 30% del ancho de la foto (relativo)
          flags: "relative",         // Hace que el width sea relativo
          opacity: config.watermark_opacity || 80
        });
      }

      const optimizedUpload = await cloudinary.uploader.upload(tempPath, {
        folder: `fototrack/albums/${idAlbum || "temp"}/optimized`,
        resource_type: "image",
        transformation: transformationOptions
      });

      // ======================================================
      // D. GUARDAR EN BASE DE DATOS
      // ======================================================
      const saved = await imageRepository.create({
        idAlbum,
        rutaOriginal: originalUpload.secure_url,
        rutaMiniatura: thumbUpload.secure_url,
        rutaOptimizado: optimizedUpload.secure_url, // 👈 ¡Esta ya tiene la marca incrustada!
        public_id: originalUpload.public_id,
      });

      return saved;

    } catch (error) {
      console.error("❌ Error en Cloudinary upload:", error);
      throw error;
    } finally {
      // Limpiar archivo temporal del servidor siempre
      try { fs.unlinkSync(tempPath); } catch (e) {
        console.warn("⚠ No se pudo borrar archivo temporal:", tempPath);
      }
    }
  },

  // ---------------------------------------------------------
  // Eliminar imagen
  // ---------------------------------------------------------
  async deleteImage(idImagen) {
    const img = await imageRepository.getImageById(idImagen);

    if (!img) throw new Error("Imagen no encontrada");

    // Intentar borrar de Cloudinary
    try {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
        // Nota: Idealmente deberíamos borrar también las derivadas (thumb/optimized)
        // pero Cloudinary a veces lo maneja automático si están vinculadas,
        // o requeriría guardar los public_id de las 3 versiones.
      }
    } catch (err) {
      console.warn("⚠ No se pudo eliminar en Cloudinary:", err.message);
    }

    await imageRepository.deleteImageById(idImagen);
    return true;
  },
};