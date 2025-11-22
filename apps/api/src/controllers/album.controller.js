// src/controllers/album.controller.js
import { albumService } from "../services/album.service.js";

export const albumController = {

  async getAll(req, res) {
    try {
      const albums = await albumService.listAlbums();
      res.json(albums);
    } catch (err) {
      console.error("Error en getAll:", err);
      res.status(500).json({ msg: "Error al obtener álbumes" });
    }
  },

  async create(req, res) {
    try {
      const albumData = req.body;
      const nuevoAlbum = await albumService.createAlbum(albumData);
      res.status(201).json(nuevoAlbum);
    } catch (err) {
      console.error("Error en create:", err);
      res.status(500).json({ msg: "Error al crear el álbum" });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      await albumService.eliminarAlbum(id);
      res.json({ ok: true, message: "Álbum eliminado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: "Error al eliminar álbum" });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      await albumService.actualizarAlbum(id, data);
      res.json({ ok: true, message: "Álbum actualizado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: "Error al actualizar álbum" });
    }
  }

};




