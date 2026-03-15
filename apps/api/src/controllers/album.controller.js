// src/controllers/album.controller.js
import { albumService } from "../services/album.service.js";
import { db } from "../config/db.js";
import { imageService } from "../services/image.service.js";
import { faceService } from "../services/face.service.js";
import fs from "fs/promises"; 

export const albumController = {

  async getAll(req, res) {
    try {
      const albums = await albumService.listAlbums();
      
      // 🛡️ FILTRO DE BAJA LÓGICA: 
      if (!req.user || req.user.rol !== 'admin') {
        const albumsActivos = albums.filter(a => a.estado !== 'oculto');
        return res.json(albumsActivos);
      }

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

      if (album.estado === 'oculto' && (!req.user || req.user.rol !== 'admin')) {
        return res.status(403).json({ ok: false, error: "Este evento ya no se encuentra disponible" });
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

  // 🗑️ BAJA LÓGICA (SOFT DELETE)
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      await db.execute("UPDATE album SET estado = 'oculto' WHERE idAlbum = ?", [id]);
      
      return res.json({
        ok: true,
        message: "Álbum ocultado correctamente.",
      });
    } catch (err) {
      console.error("Error en eliminar:", err);
      return res.status(500).json({ ok: false, error: "Error al ocultar el álbum" });
    }
  },

  // ✅ ACTUALIZADO: Persistencia directa para asegurar cambio de Estado y Precios
  async actualizar(req, res) {
    try {
      const { id } = req.params;
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
      } = req.body;

      // Realizamos el UPDATE directamente para evitar que el service ignore campos nuevos
      const [result] = await db.execute(
        `UPDATE album 
         SET nombreEvento = ?, 
             fechaEvento = ?, 
             localizacion = ?, 
             descripcion = ?, 
             precioFoto = ?, 
             precioAlbum = ?, 
             estado = ?, 
             visibilidad = ?, 
             tags = ?
         WHERE idAlbum = ?`,
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
          id
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "No se encontró el álbum para actualizar" });
      }

      return res.json({
        ok: true,
        message: "Álbum actualizado correctamente",
      });
    } catch (err) {
      console.error("Error en actualizar:", err);
      return res.status(400).json({
        ok: false,
        error: "Error al actualizar álbum en la base de datos",
      });
    }
  },

  // ⭐ Crear álbum + imágenes + IA
  async createComplete(req, res) {
    try {
      const metadata = JSON.parse(req.body.metadata);
      const { nombreEvento, fechaEvento, localizacion, descripcion, precioFoto, precioAlbum, estado, visibilidad, tags } = metadata;

      const [result] = await db.execute(
        `INSERT INTO album (
          nombreEvento, fechaEvento, localizacion, descripcion,
          precioFoto, precioAlbum, estado, visibilidad, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombreEvento, fechaEvento, localizacion, descripcion, precioFoto, precioAlbum, estado, visibilidad, tags]
      );

      const idAlbum = result.insertId;
      const codigoInterno = `ALB-${idAlbum.toString().padStart(4, "0")}`;
      await db.execute("UPDATE album SET codigoInterno = ? WHERE idAlbum = ?", [codigoInterno, idAlbum]);

      const files = req.files || [];
      console.log(`🚀 Procesando secuencialmente ${files.length} imágenes para el álbum ${idAlbum}...`);

      // ✅ FIX: Reemplazado Promise.all por for...of para evitar Error 502
      for (const file of files) {
        try {
          const savedImage = await imageService.processSingleImage(file, idAlbum);
          
          if (savedImage && savedImage.idImagen) {
            // El 'await' aquí es la clave para que la IA no ahogue al servidor
            await faceService.processAndIndexImage(file.path, savedImage.idImagen)
              .then(matches => {
                 if (matches > 0) console.log(`🤖 [IA] MATCH en img ${savedImage.idImagen}`);
              })
              .catch(err => console.error(`❌ [IA] Error en img ${savedImage.idImagen}:`, err));
          }
        } catch (error) {
          console.error(`Error procesando archivo ${file.originalname}:`, error);
        } finally {
          // Eliminamos el archivo pase lo que pase, usando await
          await fs.unlink(file.path).catch(() => {});
        }
      }

      return res.json({ success: true, idAlbum, codigoInterno });

    } catch (err) {
      console.error("Error en createComplete:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
  
  async addImagesToAlbum(req, res) {
    try {
      const { id } = req.params;
      const idAlbum = Number(id);
      const files = req.files || [];

      if (files.length === 0) {
        return res.status(400).json({ ok: false, error: "No se enviaron imágenes" });
      }

      console.log(`🚀 Añadiendo secuencialmente ${files.length} imágenes al álbum ID: ${idAlbum}...`);

      // ✅ FIX: Reemplazado Promise.all por for...of para evitar Error 502
      for (const file of files) {
        try {
          const savedImage = await imageService.processSingleImage(file, idAlbum);
          
          if (savedImage && savedImage.idImagen) {
            await faceService.processAndIndexImage(file.path, savedImage.idImagen)
              .then(matches => {
                 console.log(`🤖 [IA] Procesada img ${savedImage.idImagen}. Matches: ${matches}`);
              })
              .catch(err => console.error(`❌ [IA] Error en img ${savedImage.idImagen}:`, err));
          }
        } catch (error) {
          console.error(`❌ Error en archivo ${file.originalname}:`, error);
        } finally {
          await fs.unlink(file.path).catch(() => {});
        }
      }

      return res.json({ ok: true, message: "Imágenes añadidas y procesadas por IA" });

    } catch (err) {
      console.error("🔴 Error crítico en addImagesToAlbum:", err);
      return res.status(500).json({ ok: false, error: "Error interno al procesar imágenes" });
    }
  },

  async reprocessAlbumIA(req, res) {
    try {
      const { id } = req.params;
      const idAlbum = Number(id);

      const [imagenes] = await db.execute(
        "SELECT idImagen, rutaOriginal FROM imagenes WHERE idAlbum = ?", 
        [idAlbum]
      );

      if (imagenes.length === 0) {
        return res.status(404).json({ ok: false, error: "Este álbum no tiene fotos." });
      }

      console.log(`🔄 Re-escaneando ${imagenes.length} fotos para el álbum ${idAlbum}...`);

      let totalDetecciones = 0;
      for (const img of imagenes) {
        try {
          const numCaras = await faceService.processAndIndexImage(img.rutaOriginal, img.idImagen);
          totalDetecciones += numCaras;
        } catch (err) {
          console.error(`❌ Error en imagen ${img.idImagen}:`, err.message);
        }
      }

      return res.json({ 
        ok: true, 
        message: `Sincronización exitosa. Se detectaron ${totalDetecciones} caras.` 
      });

    } catch (error) {
      console.error("Error en reprocessAlbumIA:", error);
      return res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
  }
};