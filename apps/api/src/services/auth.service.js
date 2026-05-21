// src/services/auth.service.js
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import admin from "../config/firebaseAdmin.js";

/**
 * Genera un JWT interno para FotoTrack
 */
function generarToken(user) {
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

/**
 * findOrCreateUser
 * Ahora bloquea el acceso si el usuario no está activo.
 */
async function findOrCreateUser({ firebaseUid, correo, nombre, apellido, foto, firebaseRole }) {
  // Buscar usuario en BD
  const [rows] = await db.query(
    `SELECT * FROM usuarios WHERE correo = ? LIMIT 1`,
    [correo]
  );

  let user;

  if (rows.length === 0) {
    // Usuario NO existe → crear nuevo
    const [result] = await db.query(
      `INSERT INTO usuarios 
        (firebase_uid, nombre, apellido, correo, foto, rol, estado)
        VALUES (?, ?, ?, ?, ?, ?, 'activo')`,
      [
        firebaseUid,
        nombre || "",
        apellido || "",
        correo,
        foto || null,
        firebaseRole || "cliente",
      ]
    );

    user = {
      idUsuario: result.insertId,
      nombre: nombre || "",
      apellido: apellido || "",
      correo,
      foto: foto || null,
      rol: firebaseRole || "cliente",
      estado: 'activo'
    };

    // 🛡️ REGISTRO DE AUDITORÍA AUTOMÁTICO
    try {
      await db.query(
        `INSERT INTO auditoria (idUsuarioResponsable, idAccion, detalle) 
         VALUES (?, 1, 'Nuevo usuario registrado vía Google/Firebase')`,
        [result.insertId]
      );
    } catch (auditErr) {
      console.error("⚠️ Error guardando auditoría de registro:", auditErr.message);
    }

  } else {
    // Usuario EXISTE → actualizar datos
    user = rows[0];

    // 🛡️ REFUERZO DE SEGURIDAD CRÍTICO:
    // Si el usuario existe pero su estado NO es 'activo', lanzamos error para frenar el login.
    if (user.estado !== 'activo') {
      const error = new Error("Tu cuenta está suspendida o inactiva. Contacta al administrador.");
      error.status = 403; // Agregamos status para que el controlador lo use
      throw error;
    }

    const nuevoRol = firebaseRole || user.rol;

    await db.query(
      `UPDATE usuarios 
       SET nombre=?, apellido=?, foto=?, rol=?
       WHERE idUsuario=?`,
      [
        nombre || user.nombre,
        apellido || user.apellido,
        foto || user.foto,
        nuevoRol,
        user.idUsuario,
      ]
    );

    user = {
      ...user,
      nombre: nombre || user.nombre,
      apellido: apellido || user.apellido,
      foto: foto || user.foto,
      rol: nuevoRol,
    };
  }

  // Crear token interno solo si pasó los filtros anteriores
  const token = generarToken(user);

  return { user, token };
}

export const authService = {
  async registerWithToken(idToken) {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.email) throw new Error("La cuenta no tiene correo.");
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
    if (!decoded.email) throw new Error("Credenciales inválidas");
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
    if (!decoded.email) throw new Error("Cuenta Google sin correo");
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

  findOrCreateUser,
};