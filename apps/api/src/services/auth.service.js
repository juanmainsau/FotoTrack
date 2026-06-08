// src/services/auth.service.js
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import admin from "../config/firebaseAdmin.js";

export function generarToken(user) {
  return jwt.sign(
    {
      idUsuario: user.idUsuario,
      correo: user.correo,
      rol: user.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function getUserById(idUsuario) {
  const [rows] = await db.query(
    `
    SELECT
      u.idUsuario,
      u.firebase_uid,
      u.nombre,
      u.apellido,
      u.correo,
      u.foto,
      u.contrasena,
      u.cuit,
      r.nombre AS rol,
      er.nombre AS estado
    FROM usuarios u
    INNER JOIN roles r ON r.idRol = u.idRol
    INNER JOIN estados_registro er ON er.idEstadoRegistro = u.idEstadoRegistro
    WHERE u.idUsuario = ?
      AND u.deleted_at IS NULL
    LIMIT 1
    `,
    [idUsuario]
  );

  return rows[0] || null;
}

async function findOrCreateUser({
  firebaseUid,
  correo,
  nombre,
  apellido,
  foto,
  firebaseRole,
}) {
  const rolFinal = firebaseRole || "cliente";

  const [rows] = await db.query(
    `
    SELECT
      u.idUsuario,
      u.firebase_uid,
      u.nombre,
      u.apellido,
      u.correo,
      u.foto,
      u.contrasena,
      u.cuit,
      r.nombre AS rol,
      er.nombre AS estado
    FROM usuarios u
    INNER JOIN roles r ON r.idRol = u.idRol
    INNER JOIN estados_registro er ON er.idEstadoRegistro = u.idEstadoRegistro
    WHERE u.correo = ?
      AND u.deleted_at IS NULL
    LIMIT 1
    `,
    [correo]
  );

  let user;

  if (rows.length === 0) {
    const [result] = await db.query(
      `
      INSERT INTO usuarios (
        firebase_uid,
        nombre,
        apellido,
        correo,
        foto,
        idRol,
        idEstadoRegistro
      )
      VALUES (
        ?, ?, ?, ?, ?,
        (SELECT idRol FROM roles WHERE nombre = ? LIMIT 1),
        (SELECT idEstadoRegistro FROM estados_registro WHERE nombre = 'activo' LIMIT 1)
      )
      `,
      [
        firebaseUid,
        nombre || "",
        apellido || "",
        correo,
        foto || null,
        rolFinal,
      ]
    );

    user = {
      idUsuario: result.insertId,
      firebase_uid: firebaseUid,
      nombre: nombre || "",
      apellido: apellido || "",
      correo,
      foto: foto || null,
      rol: rolFinal,
      estado: "activo",
    };

    try {
      await db.query(
        `
        INSERT INTO auditoria (
          idUsuarioResponsable,
          idAccion,
          idTipoEntidad,
          idEntidadAfectada,
          detalle,
          datosDespues
        )
        VALUES (
          ?,
          (SELECT idAccion FROM acciones_auditoria WHERE nombre = 'CREAR' LIMIT 1),
          (SELECT idTipoEntidad FROM tipos_entidad WHERE nombre = 'usuario' LIMIT 1),
          ?,
          ?,
          ?
        )
        `,
        [
          result.insertId,
          result.insertId,
          "Nuevo usuario registrado vía Google/Firebase",
          JSON.stringify(user),
        ]
      );
    } catch (auditErr) {
      console.error("⚠️ Error guardando auditoría de registro:", auditErr.message);
    }
  } else {
    user = rows[0];

    if (user.estado !== "activo") {
      const error = new Error(
        "Tu cuenta está suspendida o inactiva. Contacta al administrador."
      );
      error.status = 403;
      throw error;
    }

    await db.query(
      `
      UPDATE usuarios
      SET
        firebase_uid = COALESCE(firebase_uid, ?),
        nombre = ?,
        apellido = ?,
        foto = ?,
        idRol = (SELECT idRol FROM roles WHERE nombre = ? LIMIT 1)
      WHERE idUsuario = ?
        AND deleted_at IS NULL
      `,
      [
        firebaseUid,
        nombre || user.nombre,
        apellido || user.apellido,
        foto || user.foto,
        rolFinal || user.rol,
        user.idUsuario,
      ]
    );

    user = {
      ...user,
      firebase_uid: user.firebase_uid || firebaseUid,
      nombre: nombre || user.nombre,
      apellido: apellido || user.apellido,
      foto: foto || user.foto,
      rol: rolFinal || user.rol,
    };
  }

  const token = generarToken(user);

  return { user, token };
}

export const authService = {
  async registerWithToken(idToken) {
    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded.email) {
      throw new Error("La cuenta no tiene correo.");
    }

    const firebaseRole = decoded.role || "cliente";

    return await findOrCreateUser({
      firebaseUid: decoded.uid,
      correo: decoded.email,
      nombre: decoded.name || "",
      apellido: decoded.family_name || "",
      foto: decoded.picture || null,
      firebaseRole,
    });
  },

  async loginWithToken(idToken) {
    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded.email) {
      throw new Error("Credenciales inválidas");
    }

    const firebaseRole = decoded.role || "cliente";

    return await findOrCreateUser({
      firebaseUid: decoded.uid,
      correo: decoded.email,
      nombre: decoded.name || "",
      apellido: decoded.family_name || "",
      foto: decoded.picture || null,
      firebaseRole,
    });
  },

  async loginWithGoogle(idToken) {
    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded.email) {
      throw new Error("Cuenta Google sin correo");
    }

    const firebaseRole = decoded.role || "cliente";

    return await findOrCreateUser({
      firebaseUid: decoded.uid,
      correo: decoded.email,
      nombre: decoded.name || "",
      apellido: decoded.family_name || "",
      foto: decoded.picture || null,
      firebaseRole,
    });
  },

  async loginWithFaceId(idUsuario) {
    const user = await getUserById(idUsuario);

    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    if (user.estado !== "activo") {
      const error = new Error(
        "Tu cuenta está suspendida o inactiva. Contacta al administrador."
      );
      error.status = 403;
      throw error;
    }

    const token = generarToken(user);

    return { user, token };
  },

  findOrCreateUser,
  getUserById,
};