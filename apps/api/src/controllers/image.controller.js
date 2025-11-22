// src/controllers/image.controller.js
import { imageService } from "../services/image.service.js";

export const imageController = {
  async upload(req, res) {
    try {
      const { idAlbum } = req.body;

      if (!req.file) {
        return res.status(400).json({ msg: "No se envió ninguna imagen." });
      }

      const saved = await imageService.processAndSaveImage(idAlbum, req.file);

      res.status(201).json(saved);
    } catch (err) {
      console.error("Error al subir imagen:", err);
      res.status(500).json({ msg: "Error al subir imagen." });
    }
  },

  async getByAlbum(req, res) {
    try {
      const { idAlbum } = req.params;

      const images = await imageService.getImagesByAlbum(idAlbum);

      res.json(images);
    } catch (err) {
      console.error("Error al obtener imágenes:", err);
      res.status(500).json({ msg: "Error al obtener imágenes" });
    }
  }
};
