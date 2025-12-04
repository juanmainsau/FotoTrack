// apps/api/src/services/config.service.js
import { configRepository } from "../repositories/config.repository.js";
import cloudinary from "../config/cloudinary.js";

export const configService = {
  
  async getConfig() {
    return await configRepository.getConfig();
  },

  async updateConfig(body) {
    return await configRepository.updateConfig(body);
  },

  async uploadWatermark(file) {
    if (!file || !file.path) {
      throw new Error("No se recibió archivo PNG para watermark.");
    }

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "fototrack/watermark",
      resource_type: "image",
      format: "png"
    });

    // Guardar el public_id
    const updated = await configRepository.updateWatermarkPublicId(result.public_id);

    return {
      ...updated,
      watermark_public_id: result.public_id,
      watermark_url: result.secure_url
    };
  }
};
