// apps/api/src/controllers/image.controller.js
import { imageService } from "../services/image.service.js";
// 👇 IMPORTANTE: Importamos el servicio de Reconocimiento Facial
import { faceService } from "../services/face.service.js";

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

  // Subir UNA imagen
  async uploadImage(req, res) {
    try {
      const file = req.file;

      if (!file) {
        return res
          .status(400)
          .json({ ok: false, error: "No se envió ninguna imagen." });
      }

      // 1. Guardar en BD y Cloudinary
      const saved = await imageService.processAndSaveSingleImage(file);

      // 2. ⚡ DISPARAR LA IA (Sin esperar/await para no bloquear al usuario)
      if (saved && saved.idImagen) {
        console.log(`⚡ [IA] Iniciando análisis para imagen única ID: ${saved.idImagen}...`);
        
        faceService.processAndIndexImage(file.path, saved.idImagen)
          .then((faces) => console.log(`🤖 [IA] Terminó imagen ${saved.idImagen}. Rostros: ${faces}`))
          .catch((err) => console.error(`❌ [IA] Error en imagen ${saved.idImagen}:`, err));
      }

      return res.json({ ok: true, imagen: saved });
    } catch (err) {
      console.error("Error en uploadImage:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  },

  // Subir MÚLTIPLES imágenes (Álbumes)
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

      // 1. Guardar todas en BD y Cloudinary
      const imagenes = await imageService.processAndSaveImages(files, idAlbum);

      // 2. ⚡ DISPARAR LA IA PARA CADA FOTO (Bucle asíncrono)
      console.log(`⚡ [IA] Disparando análisis para ${imagenes.length} imágenes...`);
      
      // Recorremos las imágenes guardadas para procesarlas
      imagenes.forEach((img, index) => {
        // Necesitamos el archivo físico original (files[index]) y el ID generado (img.idImagen)
        const originalFile = files[index]; 
        
        if (originalFile && img.idImagen) {
          faceService.processAndIndexImage(originalFile.path, img.idImagen)
            .then((n) => {
                if (n > 0) console.log(`📸 [IA] Detectados ${n} rostros en img ${img.idImagen}`);
            })
            .catch((e) => console.error(`❌ [IA] Falló img ${img.idImagen}:`, e));
        }
      });

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