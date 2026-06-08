// src/controllers/config.controller.js
import { configRepository } from "../repositories/config.repository.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const configController = {
  async getConfig(req, res) {
    try {
      const config = await configRepository.getConfig();

      return res.json({
        ok: true,
        config,
        ...config,
      });
    } catch (error) {
      console.error("❌ Error al obtener config:", error);

      return res.status(500).json({
        ok: false,
        error: "Error obteniendo configuración del sistema",
      });
    }
  },

  async updateConfig(req, res) {
    try {
      const updated = await configRepository.updateConfig(req.body);

      return res.json({
        ok: true,
        config: updated,
        ...updated,
      });
    } catch (error) {
      console.error("❌ Error al actualizar config:", error);

      return res.status(400).json({
        ok: false,
        error: error.message || "Error guardando configuración",
      });
    }
  },

  async uploadWatermark(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error: "No se ha subido ningún archivo de imagen.",
        });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "fototrack/system",
        public_id: "watermark_global",
        overwrite: true,
        resource_type: "image",
      });

      const config = await configRepository.updateConfig({
        watermark_public_id: result.public_id,
        watermark_ruta: result.secure_url,
        watermark_enabled: true,
      });

      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (e) {
        console.warn("⚠️ No se pudo borrar archivo temporal:", e.message);
      }

      return res.json({
        ok: true,
        message: "Marca de agua actualizada correctamente",
        config,
        ...config,
      });
    } catch (error) {
      console.error("❌ Error subiendo watermark:", error);

      return res.status(500).json({
        ok: false,
        error: "Error al procesar la imagen de marca de agua",
      });
    }
  },

  async getGlobalPrices(req, res) {
    try {
      const config = await configRepository.getConfig();

      return res.json({
        ok: true,
        precio_foto_default: Number(config.precio_foto_default || 0),
        precio_album_default: Number(config.precio_album_default || 0),
      });
    } catch (error) {
      console.error("❌ Error en getGlobalPrices:", error);

      return res.status(500).json({
        ok: false,
        error: "Error al obtener precios",
      });
    }
  },
};