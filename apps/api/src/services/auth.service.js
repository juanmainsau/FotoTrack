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
      rol: user.rol,  // 👈 ahora contiene el rol verdadero
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * findOrCreateUser
 * Ahora respeta el rol proveniente de Firebase e inserta auditoría.
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
        firebaseRole || "cliente",  // 👈 ahora toma el rol del token Firebase
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
      // Ajustá "detalles" o "descripcion" según cómo se llame tu columna en la DB
      await db.query(
        `INSERT INTO auditoria (idUsuario, accion, detalles) 
         VALUES (?, 'REGISTRO', 'Nuevo usuario registrado vía Google')`,
        [result.insertId]
      );
      console.log(`✅ [Auditoría] Registro guardado para el usuario ID: ${result.insertId}`);
    } catch (auditErr) {
      console.error("⚠️ Error guardando auditoría de registro:", auditErr.message);
    }

  } else {
    // Usuario EXISTE → actualizar datos y rol si cambió
    user = rows[0];

    const nuevoRol = firebaseRole || user.rol;

    await db.query(
      `UPDATE usuarios 
       SET nombre=?, apellido=?, foto=?, rol=?
       WHERE idUsuario=?`,
      [
        nombre || user.nombre,
        apellido || user.apellido,
        foto || user.foto,
        nuevoRol,                // 👈 actualizamos rol en DB
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

  // Crear token interno con el rol real
  const token = generarToken(user);

  return { user, token };
}

export const authService = {
  // --------------------------------------------------------------
  // REGISTRO (Firebase)
  // --------------------------------------------------------------
  async registerWithToken(idToken) {
    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded.email) throw new Error("La cuenta no tiene correo.");

    const firebaseRole = decoded.role || "cliente"; // 👈 extraemos rol real

    return await findOrCreateUser({
      firebaseUid: decoded.uid,
      correo: decoded.email,
      nombre: decoded.name || "",
      apellido: decoded.family_name || "",
      foto: decoded.picture || null,
      firebaseRole,
    });
  },

  // --------------------------------------------------------------
  // LOGIN TRADICIONAL (Firebase email/password)
  // --------------------------------------------------------------
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

  // --------------------------------------------------------------
  // LOGIN / REGISTRO GOOGLE
  // --------------------------------------------------------------
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