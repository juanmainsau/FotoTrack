// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // 1) Leer header Authorization
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ ok: false, error: "No autorizado (falta token)." });
    }

    const token = authHeader.split(" ")[1];

    // 2) Verificar token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ ok: false, error: "Token inválido." });
    }

    // 3) Resolver ID de usuario según lo que haya en el payload
    const userId =
      payload.idUsuario ||
      payload.id_usuario ||
      payload.userId ||
      payload.uid ||
      payload.id;

    if (!userId) {
      return res
        .status(401)
        .json({ ok: false, error: "Token sin id de usuario." });
    }

    // 4) Buscar el usuario en la BD nueva
    const [rows] = await db.query(
      `
      SELECT
        u.idUsuario,
        u.nombre,
        u.apellido,
        u.correo,
        u.foto,
        u.cuit,
        r.nombre AS rol,
        er.nombre AS estado
      FROM usuarios u
      INNER JOIN roles r
        ON r.idRol = u.idRol
      INNER JOIN estados_registro er
        ON er.idEstadoRegistro = u.idEstadoRegistro
      WHERE u.idUsuario = ?
        AND u.deleted_at IS NULL
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ ok: false, error: "Usuario no encontrado." });
    }

    const user = rows[0];

    console.log(
      "🛡️ Middleware revisando estado de:",
      user.correo,
      "Estado:",
      user.estado
    );

    if (user.estado !== "activo") {
      return res.status(403).json({
        ok: false,
        error: "Tu cuenta no está activa. Contacta al administrador.",
        isSuspended: true,
      });
    }

    // 5) Adjuntar usuario a la request manteniendo compatibilidad
    req.user = {
      idUsuario: user.idUsuario,
      id: user.idUsuario,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      foto: user.foto,
      cuit: user.cuit,
      rol: user.rol,
      estado: user.estado,
    };

    return next();
  } catch (err) {
    console.error("Error en authMiddleware:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error interno en la autenticación." });
  }
};