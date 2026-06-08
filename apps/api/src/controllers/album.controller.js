import { albumService } from "../services/album.service.js";
import { albumRepository } from "../repositories/album.repository.js";
import { imageService } from "../services/image.service.js";
import { faceService } from "../services/face.service.js";
import fs from "fs/promises";

function getUserId(req) {
  return req.user?.idUsuario || req.user?.id || null;
}

function isAdmin(req) {
  return req.user?.rol === "admin";
}

export const albumController = {
  async getAll(req, res) {
    try {
      const albums = isAdmin(req)
        ? await albumService.listAlbums()
        : await albumService.listPublicAlbums();

      return res.json(albums);
    } catch (err) {
      console.error("Error en getAll:", err);
      return res.status(500).json({
        ok: false,
        error: "Error al obtener álbumes",
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const album = await albumService.getAlbumById(id);

      if (!album) {
        return res.status(404).json({
          ok: false,
          error: "Álbum no encontrado",
        });
      }

      if (!isAdmin(req) && album.visibilidad !== "publico") {
        return res.status(403).json({
          ok: false,
          error: "Este evento no se encuentra disponible",
        });
      }

      return res.json({ ok: true, album });
    } catch (err) {
      console.error("Error en getById:", err);
      return res.status(500).json({
        ok: false,
        error: "Error al obtener álbum",
      });
    }
  },

  async create(req, res) {
    try {
      const nuevoAlbum = await albumService.createAlbum(req.body);

      const codigoInterno = `ALB-${String(nuevoAlbum.idAlbum).padStart(4, "0")}`;
      await albumRepository.updateCodigoInterno(nuevoAlbum.idAlbum, codigoInterno);

      return res.status(201).json({
        ok: true,
        idAlbum: nuevoAlbum.idAlbum,
        codigoInterno,
      });
    } catch (err) {
      console.error("Error en create:", err);
      return res.status(400).json({
        ok: false,
        error: err.message || "Error al crear el álbum",
      });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const deletedBy = getUserId(req);

      const result = await albumService.softDeleteAlbum(id, deletedBy);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          ok: false,
          error: "Álbum no encontrado o ya eliminado",
        });
      }

      return res.json({
        ok: true,
        message: "Álbum eliminado correctamente mediante baja lógica.",
      });
    } catch (err) {
      console.error("Error en eliminar:", err);
      return res.status(500).json({
        ok: false,
        error: err.message || "Error al eliminar el álbum",
      });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const result = await albumService.actualizarAlbum(id, req.body);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          ok: false,
          error: "No se encontró el álbum para actualizar",
        });
      }

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

  async createComplete(req, res) {
    let idAlbum = null;

    try {
      const metadata = JSON.parse(req.body.metadata || "{}");

      const nuevoAlbum = await albumService.createAlbum(metadata);
      idAlbum = nuevoAlbum.idAlbum;

      const codigoInterno = `ALB-${String(idAlbum).padStart(4, "0")}`;
      await albumRepository.updateCodigoInterno(idAlbum, codigoInterno);

      const files = req.files || [];

      console.log(
        `🚀 Procesando secuencialmente ${files.length} imágenes para el álbum ${idAlbum}...`
      );

      for (const file of files) {
        try {
          const savedImage = await imageService.processSingleImage(file, idAlbum);

          if (savedImage?.idImagen) {
            await faceService
              .processAndIndexImage(file.path, savedImage.idImagen)
              .then((matches) => {
                if (matches > 0) {
                  console.log(`🤖 [IA] MATCH en img ${savedImage.idImagen}`);
                }
              })
              .catch((err) =>
                console.error(`❌ [IA] Error en img ${savedImage.idImagen}:`, err)
              );
          }
        } catch (error) {
          console.error(`Error procesando archivo ${file.originalname}:`, error);
        } finally {
          await fs.unlink(file.path).catch(() => {});
        }
      }

      return res.json({
        success: true,
        ok: true,
        idAlbum,
        codigoInterno,
      });
    } catch (err) {
      console.error("Error en createComplete:", err);

      return res.status(500).json({
        success: false,
        ok: false,
        error: err.message || "Error al crear álbum completo",
      });
    }
  },

  async addImagesToAlbum(req, res) {
    try {
      const { id } = req.params;
      const idAlbum = Number(id);
      const files = req.files || [];

      const album = await albumService.getAlbumById(idAlbum);
      if (!album) {
        return res.status(404).json({
          ok: false,
          error: "Álbum no encontrado o eliminado",
        });
      }

      if (files.length === 0) {
        return res.status(400).json({
          ok: false,
          error: "No se enviaron imágenes",
        });
      }

      console.log(
        `🚀 Añadiendo secuencialmente ${files.length} imágenes al álbum ID: ${idAlbum}...`
      );

      for (const file of files) {
        try {
          const savedImage = await imageService.processSingleImage(file, idAlbum);

          if (savedImage?.idImagen) {
            await faceService
              .processAndIndexImage(file.path, savedImage.idImagen)
              .then((matches) => {
                console.log(
                  `🤖 [IA] Procesada img ${savedImage.idImagen}. Matches: ${matches}`
                );
              })
              .catch((err) =>
                console.error(`❌ [IA] Error en img ${savedImage.idImagen}:`, err)
              );
          }
        } catch (error) {
          console.error(`❌ Error en archivo ${file.originalname}:`, error);
        } finally {
          await fs.unlink(file.path).catch(() => {});
        }
      }

      return res.json({
        ok: true,
        message: "Imágenes añadidas y procesadas por IA",
      });
    } catch (err) {
      console.error("🔴 Error crítico en addImagesToAlbum:", err);
      return res.status(500).json({
        ok: false,
        error: "Error interno al procesar imágenes",
      });
    }
  },

  async reprocessAlbumIA(req, res) {
    try {
      const { id } = req.params;
      const idAlbum = Number(id);

      const album = await albumService.getAlbumById(idAlbum);
      if (!album) {
        return res.status(404).json({
          ok: false,
          error: "Álbum no encontrado o eliminado",
        });
      }

      const imagenes = await imageService.getImagesByAlbum(idAlbum);

      if (!imagenes || imagenes.length === 0) {
        return res.status(404).json({
          ok: false,
          error: "Este álbum no tiene fotos.",
        });
      }

      console.log(`🔄 Re-escaneando ${imagenes.length} fotos para el álbum ${idAlbum}...`);

      let totalDetecciones = 0;

      for (const img of imagenes) {
        try {
          const numCaras = await faceService.processAndIndexImage(
            img.rutaOriginal,
            img.idImagen
          );
          totalDetecciones += numCaras;
        } catch (err) {
          console.error(`❌ Error en imagen ${img.idImagen}:`, err.message);
        }
      }

      return res.json({
        ok: true,
        message: `Sincronización exitosa. Se detectaron ${totalDetecciones} caras.`,
      });
    } catch (error) {
      console.error("Error en reprocessAlbumIA:", error);
      return res.status(500).json({
        ok: false,
        error: "Error interno del servidor.",
      });
    }
  },
};