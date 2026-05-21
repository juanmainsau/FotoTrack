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

    // 4) Buscar el usuario en la BD (Traemos el campo estado)
    const [rows] = await db.query(
      `SELECT idUsuario, nombre, correo, rol, foto, estado
       FROM usuarios
       WHERE idUsuario = ?
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ ok: false, error: "Usuario no encontrado." });
    }

    const user = rows[0];

    // 🛡️ REFUERZO DE SEGURIDAD: Chequeo de estado suspendido
    // Si el usuario existe pero el administrador lo suspendió, no lo dejamos pasar.
    console.log("🛡️ Middleware revisando estado de:", user.correo, "Estado:", user.estado);
    if (user.estado !== 'activo') {
      return res.status(403).json({ 
        ok: false, 
        error: "Tu cuenta no está activa. Contacta al administrador.",
        isSuspended: true 
      });
    }

    // 5) Adjuntar usuario a la request
    req.user = user;

    return next();
  } catch (err) {
    console.error("Error en authMiddleware:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error interno en la autenticación." });
  }
};