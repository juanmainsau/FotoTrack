import cloudinary from "../config/cloudinary.js";
import { imageRepository } from "../repositories/image.repository.js";
import { configRepository } from "../repositories/config.repository.js";

export const imageService = {
  async getImagesByAlbum(idAlbum, includeDeleted = false) {
    return await imageRepository.getByAlbum(idAlbum, includeDeleted);
  },

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

  async processSingleImage(file, idAlbum = null) {
    if (!file || !file.path) {
      console.error("❌ imageService: archivo inválido", file);
      throw new Error("Archivo de imagen no válido.");
    }

    if (!idAlbum) {
      throw new Error("No se puede guardar una imagen sin asociarla a un álbum.");
    }

    const tempPath = file.path;

    const config = await configRepository.getConfig();

    let watermarkId = null;

    if (config?.watermark_enabled && config?.watermark_public_id) {
      watermarkId = config.watermark_public_id.replace(/\//g, ":");
    }

    try {
      const originalUpload = await cloudinary.uploader.upload(tempPath, {
        folder: `fototrack/albums/${idAlbum}`,
        resource_type: "image",
      });

      const thumbUpload = await cloudinary.uploader.upload(tempPath, {
        folder: `fototrack/albums/${idAlbum}/thumb`,
        resource_type: "image",
        transformation: [
          {
            width: 350,
            height: 350,
            crop: "fill",
            quality: "auto",
          },
        ],
      });

      const transformationOptions = [
        {
          width: 1200,
          crop: "limit",
        },
        {
          quality: Number(config?.calidad_default) || 80,
        },
      ];

      if (watermarkId) {
        transformationOptions.push({
          overlay: watermarkId,
          gravity: config.watermark_position || "south_east",
          width: config.watermark_size ? String(config.watermark_size) : "0.3",
          flags: "relative",
          opacity: Number(config.watermark_opacity) || 80,
        });
      }

      const optimizedUpload = await cloudinary.uploader.upload(tempPath, {
        folder: `fototrack/albums/${idAlbum}/optimized`,
        resource_type: "image",
        transformation: transformationOptions,
      });

      const saved = await imageRepository.create({
        idAlbum,
        rutaOriginal: originalUpload.secure_url,
        rutaMiniatura: thumbUpload.secure_url,
        rutaOptimizado: optimizedUpload.secure_url,
        public_id: originalUpload.public_id,
        public_id_thumb: thumbUpload.public_id,
        public_id_optimized: optimizedUpload.public_id,
        estado: "activo",
      });

      return saved;
    } catch (error) {
      console.error("❌ Error en Cloudinary upload:", error);
      throw error;
    }
  },

  async deleteImage(idImagen, deletedBy = null) {
    const img = await imageRepository.getImageById(idImagen);

    if (!img) {
      throw new Error("Imagen no encontrada o ya eliminada.");
    }

    // No se elimina de Cloudinary para preservar evidencia/datos.
    // Solo se realiza baja lógica en base de datos.
    await imageRepository.softDeleteImageById(idImagen, deletedBy);

    return true;
  },
};