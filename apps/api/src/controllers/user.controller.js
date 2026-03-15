import { faceService } from "../services/face.service.js";
import { db } from "../config/db.js"; 
import fs from "fs";
import admin from "../config/firebaseAdmin.js"; // Importado para Custom Claims
import { auditService } from "../services/audit.service.js"; // Importado para Auditoría

export const userController = {
  
  // =========================================================
  // 🔒 RUTAS DE ADMINISTRADOR (Gestión de usuarios)
  // =========================================================
  
  async getAllUsers(req, res) {
    try {
      const query = `
        SELECT 
          u.idUsuario, u.nombre, u.correo, u.rol, u.estado,
          /* Si es admin y no tiene CUIT, trae el de la empresa */
          COALESCE(u.cuit, (SELECT vendedor_cuit FROM parametros_sistema LIMIT 1)) as cuit_display
        FROM usuarios u
        WHERE u.estado != 'eliminado'
        ORDER BY u.rol ASC, u.nombre ASC
      `;
      const [users] = await db.query(query);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  },

  async changeRole(req, res) {
    try {
      const { id } = req.params; 
      const { rol } = req.body; 

      if (Number(id) === Number(req.user.idUsuario || req.user.id) && rol !== 'admin') {
        return res.status(400).json({ error: "No puedes quitarte el rol de administrador a ti mismo." });
      }

      const [rows] = await db.query(
        "SELECT firebase_uid, nombre, correo FROM usuarios WHERE idUsuario = ?", 
        [id]
      );
      
      const targetUser = rows; // 👈 CORRECCIÓN: Extraemos el primer registro
      
      if (!targetUser || !targetUser.firebase_uid) {
        return res.status(404).json({ error: "Usuario no encontrado o sin UID de Firebase" });
      }
      
      const { firebase_uid, nombre, correo } = targetUser;
      const identificadorAfectado = nombre ? `${nombre} (${correo})` : correo;

      await admin.auth().setCustomUserClaims(firebase_uid, { role: rol });
      await db.query("UPDATE usuarios SET rol = ? WHERE idUsuario = ?", [rol, id]);

      await auditService.log({
        req,
        idAccion: 8, 
        idTipoEntidad: 1, 
        idEntidadAfectada: id,
        detalle: `Se cambió el rol de ${identificadorAfectado} a "${rol}" en MySQL y Firebase.`
      });

      res.json({ ok: true, message: `Rol de ${identificadorAfectado} actualizado correctamente.` });

    } catch (error) {
      console.error("❌ Error sincronizando rol:", error);
      res.status(500).json({ error: "Fallo al sincronizar el rol." });
    }
  },

  async changeStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body; 
      const idResponsable = req.user.idUsuario || req.user.id;

      if (Number(id) === Number(idResponsable)) {
        return res.status(400).json({ error: "No puedes suspender tu propia cuenta." });
      }

      const [result] = await db.query("UPDATE usuarios SET estado = ? WHERE idUsuario = ?", [estado, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      await auditService.log({
        req,
        idAccion: 7, // UPDATE_STATUS
        idTipoEntidad: 1,
        idEntidadAfectada: id,
        detalle: `Estado del usuario #${id} cambiado a: ${estado}`
      });

      res.json({ ok: true, message: "Estado actualizado correctamente." });
    } catch (error) {
      console.error("❌ Error en changeStatus:", error);
      res.status(500).json({ error: "Error al actualizar el estado del usuario." });
    }
  },

  async deleteUser(req, res) {
    try {
      // 💡 CORRECCIÓN: Soporte para borrar vía /admin/:id o /me (perfil de usuario)
      const id = req.params.id || req.user.idUsuario || req.user.id;
      const idResponsable = req.user.idUsuario || req.user.id;

      const [rows] = await db.query("SELECT firebase_uid, correo FROM usuarios WHERE idUsuario = ?", [id]);
      const targetUser = rows; // 👈 CORRECCIÓN: Rows es un array, necesitamos el primer elemento

      if (!targetUser) return res.status(404).json({ error: "Usuario no encontrado" });

      if (targetUser.firebase_uid) {
        try {
          await admin.auth().deleteUser(targetUser.firebase_uid);
        } catch (fbError) {
          console.warn("Aviso: No se pudo borrar de Firebase (puede que ya no exista).", fbError.message);
        }
      }

      await db.query("UPDATE usuarios SET estado = 'eliminado', firebase_uid = NULL WHERE idUsuario = ?", [id]);

      await auditService.log({
        req,
        idAccion: (Number(idResponsable) === Number(id)) ? 10 : 9, 
        idTipoEntidad: 1,
        idEntidadAfectada: id,
        detalle: `Cuenta eliminada: ${targetUser.correo}`
      });

      res.json({ ok: true, message: "Cuenta eliminada correctamente." });
    } catch (error) {
      console.error("❌ Error eliminando cuenta:", error);
      res.status(500).json({ error: "No se pudo eliminar la cuenta." });
    }
  },

  /**
   * 🛡️ Auditoría del sistema
   */
  async getAuditLogs(req, res) {
    try {
      const query = `
        SELECT 
          a.idAuditoria,
          a.fechaHora, 
          IFNULL(u.nombre, u.correo) as usuario, 
          acc.nombre as accion, 
          acc.modulo,
          a.detalle, 
          a.ipOrigen
        FROM auditoria a
        LEFT JOIN usuarios u ON a.idUsuarioResponsable = u.idUsuario
        LEFT JOIN acciones_auditoria acc ON a.idAccion = acc.idAccion
        ORDER BY a.fechaHora DESC 
        LIMIT 50
      `;

      const [rows] = await db.query(query);
      res.json({ ok: true, logs: rows });
    } catch (error) {
      console.error("❌ Error obteniendo auditoría:", error);
      res.status(500).json({ ok: false, error: "Error al obtener los logs." });
    }
  },

  // =========================================================
  // 👤 RUTAS DEL USUARIO (Reconocimiento Facial)
  // =========================================================
  
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

  async getMyMatches(req, res) {
    try {
        const userId = req.user.id || req.user.idUsuario;

        const query = `
          SELECT 
            i.idImagen, 
            i.rutaMiniatura, 
            i.rutaOptimizado, 
            i.rutaOriginal,
            i.idAlbum,
            a.nombreEvento, 
            a.fechaEvento,
            a.precioFoto,
            uc.estado 
          FROM usuario_coincidencias uc
          JOIN imagenes i ON uc.idImagen = i.idImagen
          JOIN album a ON i.idAlbum = a.idAlbum 
          WHERE uc.idUsuario = ?
          ORDER BY a.fechaEvento DESC
        `;

        const [rows] = await db.query(query, [userId]);
        res.json({ ok: true, photos: rows });

    } catch (error) {
      console.error("❌ Error obteniendo coincidencias:", error);
      res.status(500).json({ error: "Error al consultar la base de datos." });
    }
  }
};