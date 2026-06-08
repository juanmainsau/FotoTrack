// src/controllers/user.controller.js
import { faceService } from "../services/face.service.js";
import { db } from "../config/db.js";
import fs from "fs";
import admin from "../config/firebaseAdmin.js";
import { auditService } from "../services/audit.service.js";

function getUserId(req) {
  return req.user?.idUsuario || req.user?.id;
}

export const userController = {
  async getAllUsers(req, res) {
    try {
      const query = `
        SELECT 
          u.idUsuario,
          u.nombre,
          u.apellido,
          u.correo,
          u.cuit,
          u.foto,
          u.firebase_uid,
          r.nombre AS rol,
          er.nombre AS estado,
          u.fechaRegistro,
          u.deleted_at
        FROM usuarios u
        INNER JOIN roles r ON r.idRol = u.idRol
        INNER JOIN estados_registro er ON er.idEstadoRegistro = u.idEstadoRegistro
        WHERE u.deleted_at IS NULL
        ORDER BY r.nombre ASC, u.nombre ASC
      `;

      const [users] = await db.query(query);
      return res.json(users);
    } catch (error) {
      console.error("❌ Error en getAllUsers:", error);
      return res.status(500).json({ ok: false, error: "Error al obtener usuarios" });
    }
  },

  async changeRole(req, res) {
    try {
      const { id } = req.params;
      const { rol } = req.body;

      if (!rol) {
        return res.status(400).json({ ok: false, error: "Rol requerido." });
      }

      if (Number(id) === Number(getUserId(req)) && rol !== "admin") {
        return res.status(400).json({
          ok: false,
          error: "No puedes quitarte el rol de administrador a ti mismo.",
        });
      }

      const [rows] = await db.query(
        `
        SELECT 
          u.firebase_uid,
          u.nombre,
          u.correo,
          r.nombre AS rolActual
        FROM usuarios u
        INNER JOIN roles r ON r.idRol = u.idRol
        WHERE u.idUsuario = ?
          AND u.deleted_at IS NULL
        LIMIT 1
        `,
        [id]
      );

      const targetUser = rows[0];

      if (!targetUser) {
        return res.status(404).json({ ok: false, error: "Usuario no encontrado." });
      }

      if (targetUser.firebase_uid) {
        await admin.auth().setCustomUserClaims(targetUser.firebase_uid, { role: rol });
      }

      const [result] = await db.query(
        `
        UPDATE usuarios
        SET idRol = (
          SELECT idRol
          FROM roles
          WHERE nombre = ?
          LIMIT 1
        )
        WHERE idUsuario = ?
          AND deleted_at IS NULL
        `,
        [rol, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "No se pudo actualizar el rol." });
      }

      const identificador = targetUser.correo;

      await auditService.log({
        req,
        idAccion: 8,
        idTipoEntidad: 1,
        idEntidadAfectada: id,
        detalle: `Se cambió el rol de ${identificador} de "${targetUser.rolActual}" a "${rol}".`,
      });

      return res.json({
        ok: true,
        message: `Rol de ${identificador} actualizado correctamente.`,
      });
    } catch (error) {
      console.error("❌ Error sincronizando rol:", error);
      return res.status(500).json({ ok: false, error: "Fallo al sincronizar el rol." });
    }
  },

  async changeStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const idResponsable = getUserId(req);

      if (!estado) {
        return res.status(400).json({ ok: false, error: "Estado requerido." });
      }

      const [rows] = await db.query(
        `
        SELECT 
          u.firebase_uid,
          u.correo,
          r.nombre AS rol,
          er.nombre AS estadoActual
        FROM usuarios u
        INNER JOIN roles r ON r.idRol = u.idRol
        INNER JOIN estados_registro er ON er.idEstadoRegistro = u.idEstadoRegistro
        WHERE u.idUsuario = ?
          AND u.deleted_at IS NULL
        LIMIT 1
        `,
        [id]
      );

      const targetUser = rows[0];

      if (!targetUser) {
        return res.status(404).json({ ok: false, error: "Usuario no encontrado." });
      }

      if (targetUser.rol === "admin") {
        return res.status(403).json({
          ok: false,
          error: "Las cuentas de administrador están protegidas y no pueden ser suspendidas.",
        });
      }

      if (Number(id) === Number(idResponsable)) {
        return res.status(400).json({ ok: false, error: "No puedes auto-suspenderte." });
      }

      if (targetUser.firebase_uid) {
        try {
          const isDisabled = estado === "suspendido" || estado === "inactivo";
          await admin.auth().updateUser(targetUser.firebase_uid, { disabled: isDisabled });

          if (isDisabled) {
            await admin.auth().revokeRefreshTokens(targetUser.firebase_uid);
          }
        } catch (fbError) {
          console.warn("⚠️ Firebase Sync Warning:", fbError.message);
        }
      }

      const [result] = await db.query(
        `
        UPDATE usuarios
        SET idEstadoRegistro = (
          SELECT idEstadoRegistro
          FROM estados_registro
          WHERE nombre = ?
          LIMIT 1
        )
        WHERE idUsuario = ?
          AND deleted_at IS NULL
        `,
        [estado, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "No se pudo actualizar el estado." });
      }

      await auditService.log({
        req,
        idAccion: 7,
        idTipoEntidad: 1,
        idEntidadAfectada: id,
        detalle: `Estado de la cuenta ${targetUser.correo} cambiado de "${targetUser.estadoActual}" a "${estado}".`,
      });

      return res.json({
        ok: true,
        message: `Estado actualizado a ${estado} correctamente.`,
      });
    } catch (error) {
      console.error("❌ Error en changeStatus:", error);
      return res.status(500).json({ ok: false, error: "Error al actualizar el estado del usuario." });
    }
  },

  async deleteUser(req, res) {
    try {
      const id = req.params.id || getUserId(req);
      const idResponsable = getUserId(req);

      const [rows] = await db.query(
        `
        SELECT firebase_uid, correo
        FROM usuarios
        WHERE idUsuario = ?
          AND deleted_at IS NULL
        LIMIT 1
        `,
        [id]
      );

      const targetUser = rows[0];

      if (!targetUser) {
        return res.status(404).json({ ok: false, error: "Usuario no encontrado." });
      }

      if (targetUser.firebase_uid) {
        try {
          await admin.auth().deleteUser(targetUser.firebase_uid);
        } catch (fbError) {
          console.warn("Aviso: No se pudo borrar de Firebase.", fbError.message);
        }
      }

      await db.query(
        `
        UPDATE usuarios
        SET
          firebase_uid = NULL,
          idEstadoRegistro = (
            SELECT idEstadoRegistro
            FROM estados_registro
            WHERE nombre = 'eliminado'
            LIMIT 1
          ),
          deleted_at = NOW(),
          deleted_by = ?
        WHERE idUsuario = ?
          AND deleted_at IS NULL
        `,
        [idResponsable, id]
      );

      await auditService.log({
        req,
        idAccion: Number(idResponsable) === Number(id) ? 10 : 9,
        idTipoEntidad: 1,
        idEntidadAfectada: id,
        detalle: `Cuenta eliminada mediante baja lógica: ${targetUser.correo}`,
      });

      return res.json({ ok: true, message: "Cuenta eliminada correctamente." });
    } catch (error) {
      console.error("❌ Error eliminando cuenta:", error);
      return res.status(500).json({ ok: false, error: "No se pudo eliminar la cuenta." });
    }
  },

  async getAuditLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        modulo = "",
        fechaDesde = "",
        fechaHasta = "",
        usuario = "",
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const limitNumber = Number(limit);

      let baseQuery = `
        FROM auditoria a
        LEFT JOIN usuarios u ON a.idUsuarioResponsable = u.idUsuario
        LEFT JOIN acciones_auditoria acc ON a.idAccion = acc.idAccion
        WHERE 1=1
      `;

      const queryParams = [];

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

      if (usuario) {
        baseQuery += ` AND u.correo LIKE ?`;
        queryParams.push(`%${usuario}%`);
      }

      const countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;
      const [countResult] = await db.query(countQuery, queryParams);

      const totalRegistros = countResult[0].total;
      const totalPaginas = Math.ceil(totalRegistros / limitNumber);

      const dataQuery = `
        SELECT 
          a.idAuditoria,
          a.fechaHora,
          COALESCE(u.correo, 'Usuario no disponible') AS usuario,
          acc.nombre AS accion,
          acc.modulo,
          a.detalle,
          a.datosAntes,
          a.datosDespues,
          a.ipOrigen
        ${baseQuery}
        ORDER BY a.fechaHora DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await db.query(dataQuery, [
        ...queryParams,
        limitNumber,
        offset,
      ]);

      return res.json({
        ok: true,
        logs: rows,
        paginacion: {
          total: totalRegistros,
          paginas: totalPaginas,
          paginaActual: Number(page),
          limite: limitNumber,
        },
      });
    } catch (error) {
      console.error("❌ Error obteniendo auditoría:", error);
      return res.status(500).json({ ok: false, error: "Error al obtener los logs." });
    }
  },

  async setupFaceId(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ ok: false, error: "Falta la imagen selfie." });
      }

      const userId = getUserId(req);
      const selfiePath = req.file.path;

      const result = await faceService.registerUserFace(userId, selfiePath);

      try {
        fs.unlinkSync(selfiePath);
      } catch (e) {
        console.warn("No se pudo borrar temp:", e.message);
      }

      return res.json({
        ok: true,
        msg: "Reconocimiento configurado con éxito.",
        matches: result.matchesFound,
      });
    } catch (error) {
      console.error("❌ Error en setupFaceId:", error);

      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }

      return res.status(500).json({
        ok: false,
        error: error.message || "Error configurando Face ID",
      });
    }
  },

  async getMyMatches(req, res) {
    try {
      const userId = getUserId(req);

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

          er.nombre AS estado,
          uc.confirmado,
          uc.distancia,
          uc.created_at

        FROM usuario_coincidencias uc

        INNER JOIN imagenes i
          ON uc.idImagen = i.idImagen
         AND i.deleted_at IS NULL

        INNER JOIN album a
          ON i.idAlbum = a.idAlbum
         AND a.deleted_at IS NULL

        INNER JOIN estados_registro er
          ON uc.idEstadoRegistro = er.idEstadoRegistro

        WHERE uc.idUsuario = ?
          AND uc.deleted_at IS NULL

        ORDER BY a.fechaEvento DESC, uc.created_at DESC
      `;

      const [rows] = await db.query(query, [userId]);

      return res.json({
        ok: true,
        total: rows.length,
        photos: rows,
      });
    } catch (error) {
      console.error("❌ Error obteniendo coincidencias:", error);

      return res.status(500).json({
        ok: false,
        error: "Error al consultar coincidencias faciales.",
      });
    }
  },
};