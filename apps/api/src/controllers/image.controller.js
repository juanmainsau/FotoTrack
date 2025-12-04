// apps/api/src/controllers/image.controller.js
import { imageService } from "../services/image.service.js";

export const imageController = {
  async upload(req, res) {
    try {
      const { idAlbum } = req.body;

      if (!req.file) {
        return res.status(400).json({ msg: "No se envió ninguna imagen." });
      }

      const result = await imageService.processAndSaveImage(idAlbum, req.file);

      return res.status(201).json(result);

    } catch (err) {
      console.error("Error al subir imagen:", err);
      return res.status(500).json({ msg: "Error al subir imagen" });
    }
  },

  async getByAlbum(req, res) {
    try {
      const { idAlbum } = req.params;
      const imagenes = await imageService.getImagesByAlbum(idAlbum);
      return res.json(imagenes);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Error al obtener imágenes" });
    }
  },

  // NUEVO: eliminar imagen
  async delete(req, res) {
    try {
      const { idImagen } = req.params;

      await imageService.deleteImage(idImagen);

      return res.json({
        ok: true,
        message: "Imagen eliminada correctamente",
      });

    } catch (err) {
      console.error("Error al eliminar imagen:", err);
      return res.status(500).json({
        ok: false,
        error: "No se pudo eliminar la imagen",
      });
    }
  },
};
