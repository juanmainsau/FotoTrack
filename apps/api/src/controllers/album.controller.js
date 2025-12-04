// src/controllers/album.controller.js
import { albumService } from "../services/album.service.js";
import cloudinary from "../config/cloudinary.js";
import { db } from "../config/db.js";
import { imageService } from "../services/image.service.js";

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

  async getById(req, res) {
    try {
      const { id } = req.params;
      const album = await albumService.getAlbumById(id);
      res.json(album);
    } catch (err) {
      console.error("Error en getById:", err);
      res.status(500).json({ msg: "Error al obtener el álbum" });
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
  },

  // ⭐⭐⭐ NUEVO ENDPOINT — Crear álbum con imágenes en un solo flujo
  async createComplete(req, res) {
    try {
      // 1) Metadata en JSON
      const metadata = JSON.parse(req.body.metadata);

      const {
        nombreEvento,
        fechaEvento,
        localizacion,
        descripcion,
        precioFoto,
        precioAlbum,
        estado,
        visibilidad,
        tags
      } = metadata;

      // 2) Crear álbum en BD
      const [result] = await db.execute(
        `INSERT INTO album (
          nombreEvento, fechaEvento, localizacion, descripcion,
          precioFoto, precioAlbum, estado, visibilidad, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombreEvento,
          fechaEvento,
          localizacion,
          descripcion,
          precioFoto,
          precioAlbum,
          estado,
          visibilidad,
          tags
        ]
      );

      const idAlbum = result.insertId;

      // 3) Generar código interno
      const codigoInterno = `ALB-${String(idAlbum).padStart(5, "0")}`;
      await db.execute(
        `UPDATE album SET codigoInterno = ? WHERE idAlbum = ?`,
        [codigoInterno, idAlbum]
      );

      // 4) Procesar imágenes usando la lógica original
      const files = req.files || [];

      for (const file of files) {
        // Usa tu servicio que ya hace:
        // - upload a Cloudinary
        // - genera miniatura
        // - genera rutaOptimizado
        // - inserta en tabla imagenes
        await imageService.processAndSaveImage(idAlbum, file);
      }

      res.json({
        success: true,
        idAlbum,
        codigoInterno
      });

    } catch (err) {
      console.error("Error en createComplete:", err);
      res.status(500).json({
        success: false,
        message: "Error al crear álbum completo",
        error: err.message
      });
    }
  }

};
