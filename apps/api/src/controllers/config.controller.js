// apps/api/src/controllers/config.controller.js
import { configRepository } from "../repositories/config.repository.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const configController = {
  
  // 1. Obtener la configuración al cargar la página
  async getConfig(req, res) {
    try {
      const config = await configRepository.getConfig();
      res.json(config);
    } catch (error) {
      console.error("Error al obtener config:", error);
      res.status(500).json({ error: "Error obteniendo configuración del sistema" });
    }
  },

  // 2. Guardar los sliders, switches y textos del vendedor
  async updateConfig(req, res) {
    try {
      // req.body ahora trae la watermark y los datos del vendedor
      const updated = await configRepository.updateConfig(req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error al actualizar config:", error);
      res.status(500).json({ error: "Error guardando configuración" });
    }
  },

  // 3. Subir la imagen de la marca de agua
  async uploadWatermark(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se ha subido ningún archivo de imagen." });
      }

      // Usamos un public_id fijo para no llenar la cuenta de Cloudinary de basura
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "fototrack/system",
        public_id: "watermark_global", 
        overwrite: true,
        resource_type: "image"
      });

      // Guardar la referencia en la BD
      const config = await configRepository.updateWatermarkPublicId(result.public_id);
      
      // Limpieza del archivo temporal
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("No se pudo borrar archivo temporal:", e);
      }

      res.json(config);
    } catch (error) {
      console.error("Error subiendo watermark:", error);
      res.status(500).json({ error: "Error al procesar la imagen de marca de agua" });
    }
  }
};