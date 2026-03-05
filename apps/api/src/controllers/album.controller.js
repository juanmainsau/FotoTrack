// src/controllers/album.controller.js
import { albumService } from "../services/album.service.js";
import { db } from "../config/db.js";
import { imageService } from "../services/image.service.js";
// 👇 Importamos el servicio de IA y el sistema de archivos
import { faceService } from "../services/face.service.js";
import fs from "fs/promises"; 

export const albumController = {

  async getAll(req, res) {
    try {
      const albums = await albumService.listAlbums();
      return res.json(albums);
    } catch (err) {
      console.error("Error en getAll:", err);
      return res.status(500).json({ ok: false, error: "Error al obtener álbumes" });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const album = await albumService.getAlbumById(id);

      if (!album) {
        return res.status(404).json({ ok: false, error: "Álbum no encontrado" });
      }

      return res.json({ ok: true, album });
    } catch (err) {
      console.error("Error en getById:", err);
      return res.status(500).json({ ok: false, error: "Error al obtener álbum" });
    }
  },

  async create(req, res) {
    try {
      const albumData = req.body;
      const nuevoAlbum = await albumService.createAlbum(albumData);
      return res.status(201).json({ ok: true, ...nuevoAlbum });
    } catch (err) {
      console.error("Error en create:", err);
      return res.status(400).json({ ok: false, error: err.message || "Error al crear el álbum" });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      // 1. Obtener todas las imágenes del álbum antes de borrarlo
      const [imagenes] = await db.execute("SELECT idImagen FROM imagenes WHERE idAlbum = ?", [id]);
      
      // 2. Borrar cada imagen de Cloudinary y de la IA (Pinecone)
      // Usamos Promise.all para que sea rápido en paralelo
      if (imagenes.length > 0) {
        console.log(`🗑️ Eliminando ${imagenes.length} imágenes de Cloudinary/IA del álbum ${id}...`);
        await Promise.all(
          imagenes.map((img) => imageService.deleteImage(img.idImagen))
        );
      }

      // 3. Borrado físico en la base de datos (Usamos el repository que ya tenés armado)
      // Borra en cascada: Items Carrito -> Imagenes -> Album
      const { albumRepository } = await import("../repositories/album.repository.js");
      await albumRepository.deleteHard(id);
      
      return res.json({
        ok: true,
        message: "Álbum y sus fotos eliminados permanentemente",
      });
    } catch (err) {
      console.error("Error en eliminar:", err);
      return res.status(500).json({ ok: false, error: "Error al eliminar álbum" });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
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

  // ⭐ Crear álbum + imágenes + IA + Limpieza segura
  async createComplete(req, res) {
    try {
      // 1) Metadata JSON
      const metadata = JSON.parse(req.body.metadata);
      const { nombreEvento, fechaEvento, localizacion, descripcion, precioFoto, precioAlbum, estado, visibilidad, tags } = metadata;

      // 2) Crear álbum en BD
      const [result] = await db.execute(
        `INSERT INTO album (
          nombreEvento, fechaEvento, localizacion, descripcion,
          precioFoto, precioAlbum, estado, visibilidad, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombreEvento, fechaEvento, localizacion, descripcion, precioFoto, precioAlbum, estado, visibilidad, tags]
      );

      const idAlbum = result.insertId;

      // 3) Código interno
      const codigoInterno = `ALB-${idAlbum.toString().padStart(4, "0")}`;
      await db.execute(
        "UPDATE album SET codigoInterno = ? WHERE idAlbum = ?",
        [codigoInterno, idAlbum]
      );

      // 4) Procesar imágenes e invocar a la IA
      const files = req.files || [];
      console.log(`🚀 Procesando ${files.length} imágenes para el álbum ${idAlbum}...`);

      // Usamos Promise.all para subir todo en paralelo
      const processingPromises = files.map(async (file) => {
        try {
          // A. Subir a Cloudinary y Guardar en DB (IMPORTANTE: imageService YA NO BORRA el archivo)
          const savedImage = await imageService.processSingleImage(file, idAlbum);
          
          // B. Si se guardó bien, disparar la IA
          if (savedImage && savedImage.idImagen) {
            // No usamos await para no bloquear la respuesta al usuario
            faceService.processAndIndexImage(file.path, savedImage.idImagen)
              .then(matches => {
                 if (matches > 0) console.log(`🤖 [IA] MATCH detectado en img ${savedImage.idImagen}`);
              })
              .catch(err => console.error(`❌ [IA] Error analizando img ${savedImage.idImagen}:`, err))
              .finally(() => {
                 // C. 🗑️ LIMPIEZA FINAL: Aquí es seguro borrar el archivo porque la IA ya terminó
                 fs.unlink(file.path).catch(() => {}); 
              });
          } else {
             // Si falló el guardado en BD, borramos el archivo inmediatamente
             fs.unlink(file.path).catch(() => {});
          }
        } catch (error) {
          console.error(`Error procesando archivo ${file.originalname}:`, error);
          // Si hubo error en la subida, borramos el archivo para no dejar basura
          fs.unlink(file.path).catch(() => {});
        }
      });

      // Esperamos a que todas las subidas a Cloudinary terminen (la IA corre en background)
      await Promise.all(processingPromises);

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