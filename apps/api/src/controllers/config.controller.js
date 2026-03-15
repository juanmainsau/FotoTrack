import { configRepository } from "../repositories/config.repository.js";
import { db } from "../config/db.js"; 
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const configController = {
  
  async getConfig(req, res) {
    try {
      const config = await configRepository.getConfig();
      res.json(config);
    } catch (error) {
      console.error("Error al obtener config:", error);
      res.status(500).json({ error: "Error obteniendo configuración del sistema" });
    }
  },

  async updateConfig(req, res) {
    try {
      // 💡 Asegúrate que configRepository.updateConfig mapee bien precio_foto_default
      const updated = await configRepository.updateConfig(req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error al actualizar config:", error);
      res.status(500).json({ error: "Error guardando configuración" });
    }
  },

  async uploadWatermark(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se ha subido ningún archivo de imagen." });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "fototrack/system",
        public_id: "watermark_global", 
        overwrite: true,
        resource_type: "image"
      });

      const config = await configRepository.updateWatermarkPublicId(result.public_id);
      
      try {
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
      } catch (e) {
        console.warn("No se pudo borrar archivo temporal:", e);
      }

      res.json(config);
    } catch (error) {
      console.error("Error subiendo watermark:", error);
      res.status(500).json({ error: "Error al procesar la imagen de marca de agua" });
    }
  },

  // 💰 Obtener precios por defecto para el Front (Create Album)
  async getGlobalPrices(req, res) {
    try {
      // 1. Extraemos directamente el primer registro del array
      const [rows] = await db.query("SELECT precio_foto_default, precio_album_default FROM parametros_sistema LIMIT 1");
      
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "No hay parámetros configurados" });
      }

      // 2. IMPORTANTE: Enviamos el nombre de campo exacto que espera el Frontend (precio_foto_default)
      // Usamos rows[0] porque la consulta devuelve un array de resultados
      const config = rows[0];
      
      res.json({ 
        ok: true, 
        precio_foto_default: config.precio_foto_default,
        precio_album_default: config.precio_album_default 
      });

    } catch (error) {
      console.error("Error en getGlobalPrices:", error);
      res.status(500).json({ error: "Error al obtener precios" });
    }
  }
};