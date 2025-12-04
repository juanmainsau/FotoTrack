// apps/api/src/services/image.service.js
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { imageRepository } from "../repositories/image.repository.js";
import { configRepository } from "../repositories/config.repository.js";

export const imageService = {
  /**
   * Procesa la imagen:
   * - Sube original
   * - Genera procesada (1000px + watermark)
   * - Genera miniatura (350x350)
   * - Guarda todo en BD
   */
  async processAndSaveImage(idAlbum, archivo) {
    if (!idAlbum) throw new Error("Falta idAlbum para asociar la imagen.");
    if (!archivo || !archivo.path) throw new Error("No se recibió archivo para procesar.");

    const tempPath = archivo.path;

    try {
      // CONFIGURACIONES GLOBALES
      const config = await configRepository.getConfig();

      const watermarkEnabled = !!config.watermark_enabled;
      const watermarkPublicId = config.watermark_public_id;
      const watermarkOpacity = config.watermark_opacity;
      const watermarkSize = config.watermark_size;
      const watermarkPosition = config.watermark_position;
      const calidadDefault = config.calidad_default || "auto";

      // SUBIR ORIGINAL
      const uploadResult = await cloudinary.uploader.upload(tempPath, {
        folder: `fototrack/albums/${idAlbum}`,
        use_filename: true,
        unique_filename: true,
        resource_type: "image",
      });

      const publicId = uploadResult.public_id;
      const rutaOriginal = uploadResult.secure_url;

      // PROCESADA CON WATERMARK
      let watermarkTransform = [];

      if (watermarkEnabled && watermarkPublicId) {
        const overlayId = watermarkPublicId.replaceAll("/", ":");

        watermarkTransform = [
          {
            overlay: overlayId,
            opacity: watermarkOpacity,
            width: watermarkSize,
            flags: "relative",
            gravity: watermarkPosition,
          },
        ];
      }

      const rutaProcesada = cloudinary.url(publicId, {
        transformation: [
          { width: 1000, crop: "limit", quality: calidadDefault, fetch_format: "auto" },
          ...watermarkTransform,
        ],
        secure: true,
      });

      // MINIATURA 350x350
      const rutaMiniatura = cloudinary.url(publicId, {
        transformation: [
          { width: 350, height: 350, crop: "fill", gravity: "auto", quality: "auto", fetch_format: "auto" },
        ],
        secure: true,
      });

      // GUARDAR EN BD
      const newImg = await imageRepository.create({
        idAlbum,
        rutaOriginal,
        rutaMiniatura,
        rutaOptimizado: rutaProcesada,
        public_id: publicId,
      });

      return {
        idImagen: newImg.idImagen,
        idAlbum,
        rutaOriginal,
        rutaProcesada,
        rutaMiniatura,
        public_id: publicId,
      };
    } finally {
      // BORRAR ARCHIVO TEMPORAL
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch (err) {
        console.warn("No se pudo eliminar archivo temporal:", err.message);
      }
    }
  },

  async getImagesByAlbum(idAlbum) {
    return await imageRepository.getByAlbum(idAlbum);
  },

  async deleteImage(idImagen) {
    const img = await imageRepository.getImageById(idImagen);
    if (!img) throw new Error("Imagen no encontrada");

    // eliminar en cloudinary
    if (img.public_id) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    // eliminar BD
    await imageRepository.deleteImageById(idImagen);

    return true;
  },
};
