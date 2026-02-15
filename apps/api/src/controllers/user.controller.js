import { faceService } from "../services/face.service.js";
import { db } from "../config/db.js"; 
import fs from "fs";
// 👇 Importamos el middleware centralizado
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

export const userController = {
  
  // ---------------------------------------------------------
  // Subir selfie y configurar reconocimiento facial
  // ---------------------------------------------------------
  async setupFaceId(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Falta la imagen (selfie)" });
      }
      
      const userId = req.user.id || req.user.idUsuario; 
      const selfiePath = req.file.path;

      const result = await faceService.registerUserFace(userId, selfiePath);

      try { fs.unlinkSync(selfiePath); } catch(e) { console.warn("No se pudo borrar temp:", e.message); }

      res.json({ 
        ok: true, 
        msg: "Reconocimiento configurado con éxito.", 
        matches: result.matchesFound 
      });

    } catch (error) {
      console.error("❌ Error en setupFaceId:", error);
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch(e) {}
      }
      res.status(500).json({ error: error.message || "Error configurando Face ID" });
    }
  },

  // ---------------------------------------------------------
  // Obtener mis coincidencias (Fotos donde salgo)
  // ---------------------------------------------------------
  async getMyMatches(req, res) {
    try {
        const userId = req.user.id || req.user.idUsuario;

        // 👇 CORRECCIÓN: Usamos la tabla real 'usuario_coincidencias'
        const query = `
          SELECT 
            i.idImagen, 
            i.rutaMiniatura, 
            i.rutaOptimizado, 
            i.rutaOriginal,
            a.idAlbum,
            a.nombreEvento, 
            a.fechaEvento,
            a.precioFoto
          FROM usuario_coincidencias uc
          JOIN imagenes i ON uc.idImagen = i.idImagen
          JOIN album a ON i.idAlbum = a.idAlbum
          WHERE uc.idUsuario = ?
          ORDER BY a.fechaEvento DESC
        `;

        const [rows] = await db.query(query, [userId]);
        
        res.json({ 
            ok: true, 
            photos: rows 
        });

    } catch (error) {
      console.error("Error obteniendo coincidencias:", error);
      res.status(500).json({ error: "Error obteniendo tus fotos" });
    }
  }
};