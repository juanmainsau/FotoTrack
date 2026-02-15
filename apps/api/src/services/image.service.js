// apps/api/src/services/image.service.js
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { imageRepository } from "../repositories/image.repository.js";
import { configRepository } from "../repositories/config.repository.js";

export const imageService = {
  
  // Obtener imágenes por álbum
  async getImagesByAlbum(idAlbum) {
    return await imageRepository.getByAlbum(idAlbum);
  },

  // Procesar y guardar imágenes (sin borrar el archivo temporal aún)
  async processAndSaveImages(files) {
    const processed = [];
    for (const file of files) {
      const img = await this.processSingleImage(file, null);
      processed.push(img);
    }
    return processed;
  },

  async addImagesToAlbum(idAlbum, files) {
    const results = [];
    for (const file of files) {
      const img = await this.processSingleImage(file, idAlbum);
      results.push(img);
    }
    return results;
  },

  // ⭐ FUNCIÓN CENTRAL
  async processSingleImage(file, idAlbum = null) {
    if (!file || !file.path) {
      console.error("❌ imageService: archivo inválido", file);
      throw new Error("Archivo de imagen no válido.");
    }
    
    const tempPath = file.path;

    // 1. Configuración de marca de agua
    const config = await configRepository.getConfig();
    let watermarkId = null;
    if (config && config.watermark_enabled && config.watermark_public_id) {
        watermarkId = config.watermark_public_id.replace(/\//g, ":");
    }

    try {
      // A. SUBIR ORIGINAL
      const originalUpload = await cloudinary.uploader.upload(tempPath, {
        folder: `fototrack/albums/${idAlbum || "temp"}`,
        resource_type: "image",
      });

      // B. SUBIR MINIATURA
      const thumbUpload = await cloudinary.uploader.upload(tempPath, {
        folder: `fototrack/albums/${idAlbum || "temp"}/thumb`,
        resource_type: "image",
        transformation: [{ width: 350, height: 350, crop: "fill", quality: "auto" }]
      });

      // C. SUBIR OPTIMIZADA
      const transformationOptions = [
        { width: 1200, crop: "limit" },
        { quality: 80 }
      ];

      if (watermarkId) {
        transformationOptions.push({
          overlay: watermarkId,
          gravity: config.watermark_position || "southeast",
          width: "0.3",
          flags: "relative",
          opacity: config.watermark_opacity || 80
        });
      }

      const optimizedUpload = await cloudinary.uploader.upload(tempPath, {
        folder: `fototrack/albums/${idAlbum || "temp"}/optimized`,
        resource_type: "image",
        transformation: transformationOptions
      });

      // D. GUARDAR EN BD
      const saved = await imageRepository.create({
        idAlbum,
        rutaOriginal: originalUpload.secure_url,
        rutaMiniatura: thumbUpload.secure_url,
        rutaOptimizado: optimizedUpload.secure_url,
        public_id: originalUpload.public_id,
      });

      // ⚠️ IMPORTANTE: Devolvemos el objeto completo con el ID explícito
      // MySQL devuelve 'insertId', así que lo normalizamos a 'idImagen'
      return { 
        ...saved, 
        idImagen: saved.insertId || saved.idImagen 
      };

    } catch (error) {
      console.error("❌ Error en Cloudinary upload:", error);
      throw error;
    } 
    // ❌ ELIMINADO EL BLOQUE FINALLY: No borramos el archivo aquí
    // para que la IA pueda leerlo después en el controlador.
  },

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