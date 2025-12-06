// src/controllers/image.controller.js
import { imageService } from "../services/image.service.js";

export const imageController = {
  // Obtener imágenes por álbum
  async getByAlbum(req, res) {
    try {
      const { idAlbum } = req.params;
      const imagenes = await imageService.getImagesByAlbum(idAlbum);
      return res.json({ ok: true, imagenes });
    } catch (err) {
      console.error("Error en getByAlbum:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  },

  // Subir UNA imagen (no es lo que más usamos, pero lo dejamos estable)
  async uploadImage(req, res) {
    try {
      const file = req.file;

      if (!file) {
        return res
          .status(400)
          .json({ ok: false, error: "No se envió ninguna imagen." });
      }

      const saved = await imageService.processAndSaveSingleImage(file);

      return res.json({ ok: true, imagen: saved });
    } catch (err) {
      console.error("Error en uploadImage:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  },

  // Subir MÚLTIPLES imágenes (creación de álbum)
  async uploadImages(req, res) {
    try {
      const files = req.files;
      const { idAlbum } = req.body;

      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ ok: false, error: "No se enviaron imágenes." });
      }

      if (!idAlbum) {
        return res
          .status(400)
          .json({ ok: false, error: "Falta idAlbum en el cuerpo." });
      }

      const imagenes = await imageService.processAndSaveImages(files, idAlbum);

      return res.json({ ok: true, imagenes });
    } catch (err) {
      console.error("Error en uploadImages:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  },

  // Eliminar una imagen
  async deleteImage(req, res) {
    try {
      const { idImagen } = req.params;

      await imageService.deleteImage(idImagen);

      return res.json({ ok: true });
    } catch (err) {
      console.error("Error en deleteImage:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  },
};
