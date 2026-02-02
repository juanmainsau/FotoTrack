// src/controllers/album.controller.js
import { albumService } from "../services/album.service.js";
import cloudinary from "../config/cloudinary.js";
import { db } from "../config/db.js";
import { imageService } from "../services/image.service.js";

export const albumController = {

  async getAll(req, res) {
    try {
      const albums = await albumService.listAlbums();
      return res.json(albums);
    } catch (err) {
      console.error("Error en getAll:", err);
      return res
        .status(500)
        .json({ ok: false, error: "Error al obtener álbumes" });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const album = await albumService.getAlbumById(id);

      if (!album) {
        return res
          .status(404)
          .json({ ok: false, error: "Álbum no encontrado" });
      }

      return res.json({ ok: true, album });
    } catch (err) {
      console.error("Error en getById:", err);
      return res
        .status(500)
        .json({ ok: false, error: "Error al obtener álbum" });
    }
  },

  async create(req, res) {
    try {
      const albumData = req.body;
      const nuevoAlbum = await albumService.createAlbum(albumData);
      return res.status(201).json({ ok: true, ...nuevoAlbum });
    } catch (err) {
      console.error("Error en create:", err);
      return res
        .status(400)
        .json({ ok: false, error: err.message || "Error al crear el álbum" });
    }
  },

  // 🗑️ MODIFICADO: Borrado Físico (Hard Delete)
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      
      // Llamamos al servicio que borra fotos de Cloudinary y registros de la BD
      await albumService.deleteAlbumHard(id);
      
      return res.json({
        ok: true,
        message: "Álbum y sus fotos eliminados permanentemente",
      });
    } catch (err) {
      console.error("Error en eliminar:", err);
      return res
        .status(500)
        .json({ ok: false, error: "Error al eliminar álbum" });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // El servicio ahora se encarga de no borrar datos si vienen vacíos (merge)
      await albumService.actualizarAlbum(id, data);

      return res.json({
        ok: true,
        message: "Álbum actualizado correctamente",
      });
    } catch (err) {
      console.error("Error en actualizar:", err);
      return res.status(400).json({
        ok: false,
        error: err.message || "Error al actualizar álbum",
      });
    }
  },

  // ⭐ Crear álbum + imágenes (Carga inicial masiva)
  async createComplete(req, res) {
    try {
      // 1) Metadata JSON
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
        tags,
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
          tags,
        ]
      );

      const idAlbum = result.insertId;

      // 3) Código interno
      const codigoInterno = `ALB-${idAlbum.toString().padStart(4, "0")}`;
      await db.execute(
        "UPDATE album SET codigoInterno = ? WHERE idAlbum = ?",
        [codigoInterno, idAlbum]
      );

      // 4) Procesar imágenes
      const files = req.files || [];

      // Usamos el imageService actualizado que ya gestiona Cloudinary directo
      for (const file of files) {
        await imageService.processSingleImage(file, idAlbum);
      }

      return res.json({
        success: true,
        idAlbum,
        codigoInterno,
      });

    } catch (err) {
      console.error("Error en createComplete:", err);
      return res.status(500).json({
        success: false,
        message: "Error al crear álbum completo",
        error: err.message,
      });
    }
  },
};