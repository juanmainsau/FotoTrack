// apps/api/src/controllers/image.controller.js
import fs from "fs/promises";
import { imageService } from "../services/image.service.js";
import { faceService } from "../services/face.service.js";

function getUserId(req) {
  return req.user?.idUsuario || req.user?.id || null;
}

export const imageController = {
  async getByAlbum(req, res) {
    try {
      const { idAlbum } = req.params;

      const imagenes = await imageService.getImagesByAlbum(Number(idAlbum));

      return res.json({
        ok: true,
        imagenes,
      });
    } catch (err) {
      console.error("❌ Error en getByAlbum:", err);

      return res.status(500).json({
        ok: false,
        error: err.message,
      });
    }
  },

  async uploadImage(req, res) {
    try {
      const file = req.file;
      const { idAlbum } = req.body;

      if (!file) {
        return res.status(400).json({
          ok: false,
          error: "No se envió ninguna imagen.",
        });
      }

      if (!idAlbum) {
        return res.status(400).json({
          ok: false,
          error: "Falta idAlbum.",
        });
      }

      const saved = await imageService.processSingleImage(file, Number(idAlbum));

      if (saved?.idImagen) {
        try {
          const faces = await faceService.processAndIndexImage(
            file.path,
            saved.idImagen
          );

          console.log(
            `🤖 [IA] Imagen ${saved.idImagen} procesada. Rostros: ${faces}`
          );
        } catch (iaError) {
          console.error(`❌ [IA] Error en imagen ${saved.idImagen}:`, iaError);
        }
      }

      await fs.unlink(file.path).catch(() => {});

      return res.json({
        ok: true,
        imagen: saved,
      });
    } catch (err) {
      console.error("❌ Error en uploadImage:", err);

      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }

      return res.status(500).json({
        ok: false,
        error: err.message,
      });
    }
  },

  async uploadImages(req, res) {
    try {
      const files = req.files || [];
      const { idAlbum } = req.body;

      if (!files.length) {
        return res.status(400).json({
          ok: false,
          error: "No se enviaron imágenes.",
        });
      }

      if (!idAlbum) {
        return res.status(400).json({
          ok: false,
          error: "Falta idAlbum en el cuerpo.",
        });
      }

      const imagenes = [];

      for (const file of files) {
        try {
          const saved = await imageService.processSingleImage(
            file,
            Number(idAlbum)
          );

          imagenes.push(saved);

          if (saved?.idImagen) {
            try {
              const faces = await faceService.processAndIndexImage(
                file.path,
                saved.idImagen
              );

              if (faces > 0) {
                console.log(
                  `📸 [IA] Detectados ${faces} rostros en img ${saved.idImagen}`
                );
              }
            } catch (iaError) {
              console.error(
                `❌ [IA] Error procesando img ${saved.idImagen}:`,
                iaError
              );
            }
          }
        } catch (fileError) {
          console.error(
            `❌ Error procesando archivo ${file.originalname}:`,
            fileError
          );
        } finally {
          await fs.unlink(file.path).catch(() => {});
        }
      }

      return res.json({
        ok: true,
        imagenes,
      });
    } catch (err) {
      console.error("❌ Error en uploadImages:", err);

      for (const file of req.files || []) {
        await fs.unlink(file.path).catch(() => {});
      }

      return res.status(500).json({
        ok: false,
        error: err.message,
      });
    }
  },

  async deleteImage(req, res) {
    try {
      const { idImagen } = req.params;
      const deletedBy = getUserId(req);

      await imageService.deleteImage(Number(idImagen), deletedBy);

      return res.json({
        ok: true,
      });
    } catch (err) {
      console.error("❌ Error en deleteImage:", err);

      return res.status(500).json({
        ok: false,
        error: err.message,
      });
    }
  },
};