import { faceService } from "../services/face.service.js";
import { db } from "../config/db.js"; 
import fs from "fs";
import admin from "../config/firebaseAdmin.js"; 
import { auditService } from "../services/audit.service.js"; 

export const userController = {
  
  // =========================================================
  // 🔒 RUTAS DE ADMINISTRADOR (Gestión de usuarios)
  // =========================================================
  
  async getAllUsers(req, res) {
    try {
      const query = `
        SELECT 
          u.idUsuario, u.nombre, u.correo, u.rol, u.estado,
          COALESCE(u.cuit, (SELECT vendedor_cuit FROM parametros_sistema LIMIT 1)) as cuit_display
        FROM usuarios u
        WHERE u.estado != 'eliminado'
        ORDER BY u.rol ASC, u.nombre ASC
      `;
      const [users] = await db.query(query);
      res.json(users);
    } catch (error) {
      console.error("❌ Error en getAllUsers:", error);
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
      
      const targetUser = rows[0]; // ✅ CORRECCIÓN: Accedemos al primer elemento del array
      
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

    // 1. Buscamos los datos del usuario afectado
    const [rows] = await db.query("SELECT rol, firebase_uid FROM usuarios WHERE idUsuario = ?", [id]);
    const targetUser = rows[0];

    if (!targetUser) return res.status(404).json({ error: "Usuario no encontrado." });

    // 🛡️ REGLA DE NEGOCIO: Los administradores son inmunes a la suspensión
    if (targetUser.rol === 'admin') {
      return res.status(403).json({ 
        ok: false, 
        error: "Las cuentas de administrador están protegidas y no pueden ser suspendidas." 
      });
    }

    if (Number(id) === Number(idResponsable)) {
      return res.status(400).json({ ok: false, error: "No puedes auto-suspenderte." });
    }

      // 2. ⚡ SYNC CON FIREBASE: Deshabilitar acceso si está suspendido
      if (targetUser.firebase_uid) {
        try {
          const isDisabled = (estado === 'suspendido');
          await admin.auth().updateUser(targetUser.firebase_uid, { disabled: isDisabled });
          if (isDisabled) {
            await admin.auth().revokeRefreshTokens(targetUser.firebase_uid);
          }
        } catch (fbError) {
          console.warn("⚠️ Firebase Sync Warning:", fbError.message);
        }
      }

      // 3. Actualización en DB
      const [result] = await db.query("UPDATE usuarios SET estado = ? WHERE idUsuario = ?", [estado, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No se pudo actualizar el estado en DB." });
      }

      await auditService.log({
        req,
        idAccion: 7, // UPDATE_STATUS
        idTipoEntidad: 1,
        idEntidadAfectada: id,
        detalle: `Estado del usuario #${id} cambiado a: ${estado}`
      });

      res.json({ ok: true, message: `Estado actualizado a ${estado} correctamente.` });
    } catch (error) {
      console.error("❌ Error en changeStatus:", error);
      res.status(500).json({ error: "Error al actualizar el estado del usuario." });
    }
  },

  async deleteUser(req, res) {
    try {
      const id = req.params.id || req.user.idUsuario || req.user.id;
      const idResponsable = req.user.idUsuario || req.user.id;

      const [rows] = await db.query("SELECT firebase_uid, correo FROM usuarios WHERE idUsuario = ?", [id]);
      const targetUser = rows[0]; // ✅ CORRECCIÓN: Accedemos al primer elemento

      if (!targetUser) return res.status(404).json({ error: "Usuario no encontrado" });

      if (targetUser.firebase_uid) {
        try {
          await admin.auth().deleteUser(targetUser.firebase_uid);
        } catch (fbError) {
          console.warn("Aviso: No se pudo borrar de Firebase.", fbError.message);
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

  async getAuditLogs(req, res) {
    try {
      // 1. Recibir parámetros de la URL (Query Params)
      const { 
        page = 1, 
        limit = 20, 
        modulo = '', 
        fechaDesde = '', 
        fechaHasta = '',
        usuario = '' // 👈 Agregamos el parámetro usuario
      } = req.query;

      // Convertir a números para la paginación
      const offset = (Number(page) - 1) * Number(limit);
      const limitNumber = Number(limit);

      // 2. Construir la consulta dinámica
      let baseQuery = `
        FROM auditoria a
        LEFT JOIN usuarios u ON a.idUsuarioResponsable = u.idUsuario
        LEFT JOIN acciones_auditoria acc ON a.idAccion = acc.idAccion
        WHERE 1=1
      `;
      const queryParams = [];

      // Aplicar filtros si existen
      if (modulo) {
        baseQuery += ` AND acc.modulo = ?`;
        queryParams.push(modulo);
      }
      if (fechaDesde) {
        baseQuery += ` AND DATE(a.fechaHora) >= ?`;
        queryParams.push(fechaDesde);
      }
      if (fechaHasta) {
        baseQuery += ` AND DATE(a.fechaHora) <= ?`;
        queryParams.push(fechaHasta);
      }
      // 👈 Filtro por nombre o correo del usuario
      if (usuario) {
        baseQuery += ` AND (u.nombre LIKE ? OR u.correo LIKE ?)`;
        queryParams.push(`%${usuario}%`, `%${usuario}%`);
      }

      // 3. Contar el total de registros (Para que el Frontend arme las páginas)
      const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
      const [countResult] = await db.query(countQuery, queryParams);
      const totalRegistros = countResult[0].total;
      const totalPaginas = Math.ceil(totalRegistros / limitNumber);

      // 4. Traer los registros de la página actual
      const dataQuery = `
        SELECT 
          a.idAuditoria,
          a.fechaHora, 
          IFNULL(u.nombre, u.correo) as usuario, 
          acc.nombre as accion, 
          acc.modulo,
          a.detalle, 
          a.ipOrigen
        ${baseQuery}
        ORDER BY a.fechaHora DESC 
        LIMIT ? OFFSET ?
      `;
      
      // Agregamos limit y offset al final de los parámetros
      queryParams.push(limitNumber, offset);
      const [rows] = await db.query(dataQuery, queryParams);

      // 5. Devolver todo estructurado
      res.json({ 
        ok: true, 
        logs: rows,
        paginacion: {
          total: totalRegistros,
          paginas: totalPaginas,
          paginaActual: Number(page),
          limite: limitNumber
        }
      });
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