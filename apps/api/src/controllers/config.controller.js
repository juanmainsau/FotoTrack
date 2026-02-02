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

  // 2. Guardar los sliders y switches (sin imagen)
  async updateConfig(req, res) {
    try {
      // req.body trae { watermark_opacity: 50, ... }
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
      // Multer deja el archivo en req.file
      if (!req.file) {
        return res.status(400).json({ error: "No se ha subido ningún archivo de imagen." });
      }

      // a) Subir a Cloudinary
      // Usamos un public_id fijo "watermark_global" para sobreescribir la anterior
      // y no llenar tu cuenta de Cloudinary de basura si suben muchas pruebas.
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "fototrack/system",
        public_id: "watermark_global", 
        overwrite: true,
        resource_type: "image"
      });

      // b) Guardar la referencia (public_id) en la BD
      const config = await configRepository.updateWatermarkPublicId(result.public_id);
      
      // c) Borrar el archivo temporal del servidor (limpieza)
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