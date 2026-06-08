// src/repositories/user.repository.js
import { db } from "../config/db.js";

const USER_SELECT = `
  SELECT
    u.idUsuario,
    u.firebase_uid,
    u.nombre,
    u.apellido,
    u.correo,
    u.foto,
    u.contrasena,
    u.cuit,
    u.fechaRegistro,
    u.deleted_at,

    r.nombre AS rol,
    er.nombre AS estado,

    irf.rutaArchivo AS foto_referencia,

    p.telefono,
    p.consentimientoRF,
    p.direccion,
    p.pais,
    p.codigoPostal

  FROM usuarios u

  INNER JOIN roles r
    ON r.idRol = u.idRol

  INNER JOIN estados_registro er
    ON er.idEstadoRegistro = u.idEstadoRegistro

  LEFT JOIN img_referencia_facial irf
    ON irf.idUsuario = u.idUsuario
   AND irf.esActiva = 1
   AND irf.deleted_at IS NULL

  LEFT JOIN perfiles p
    ON p.idUsuario = u.idUsuario
   AND p.deleted_at IS NULL
`;

export const userRepository = {
  async findByEmail(correo) {
    const [rows] = await db.query(
      `
      ${USER_SELECT}
      WHERE u.correo = ?
        AND u.deleted_at IS NULL
      LIMIT 1
      `,
      [correo]
    );

    return rows[0] || null;
  },

  async findByFirebaseUid(firebaseUid) {
    const [rows] = await db.query(
      `
      ${USER_SELECT}
      WHERE u.firebase_uid = ?
        AND u.deleted_at IS NULL
      LIMIT 1
      `,
      [firebaseUid]
    );

    return rows[0] || null;
  },

  async findById(idUsuario) {
    const [rows] = await db.query(
      `
      ${USER_SELECT}
      WHERE u.idUsuario = ?
        AND u.deleted_at IS NULL
      LIMIT 1
      `,
      [idUsuario]
    );

    return rows[0] || null;
  },

  async createTraditionalUser({ correo, passwordHash, nombre = "" }) {
    const [result] = await db.query(
      `
      INSERT INTO usuarios (
        correo,
        nombre,
        contrasena,
        idRol,
        idEstadoRegistro
      )
      VALUES (
        ?, ?, ?,
        (SELECT idRol FROM roles WHERE nombre = 'cliente' LIMIT 1),
        (SELECT idEstadoRegistro FROM estados_registro WHERE nombre = 'activo' LIMIT 1)
      )
      `,
      [correo, nombre, passwordHash]
    );

    return this.findById(result.insertId);
  },

  async createGoogleUser({ firebaseUid, correo, nombre }) {
    const [result] = await db.query(
      `
      INSERT INTO usuarios (
        firebase_uid,
        correo,
        nombre,
        idRol,
        idEstadoRegistro
      )
      VALUES (
        ?, ?, ?,
        (SELECT idRol FROM roles WHERE nombre = 'cliente' LIMIT 1),
        (SELECT idEstadoRegistro FROM estados_registro WHERE nombre = 'activo' LIMIT 1)
      )
      `,
      [firebaseUid, correo, nombre || ""]
    );

    return this.findById(result.insertId);
  },

  async linkGoogleAccountByEmail({ firebaseUid, correo }) {
    await db.query(
      `
      UPDATE usuarios
      SET firebase_uid = ?
      WHERE correo = ?
        AND deleted_at IS NULL
      `,
      [firebaseUid, correo]
    );

    return this.findByEmail(correo);
  },

  async updateUserCart(idUsuario, idCarrito) {
    return true;
  },

  async updateProfile(idUsuario, { nombre, cuit }) {
    const [result] = await db.query(
      `
      UPDATE usuarios
      SET nombre = ?, cuit = ?
      WHERE idUsuario = ?
        AND deleted_at IS NULL
      `,
      [nombre, cuit || null, idUsuario]
    );

    return result;
  },

  async upsertProfileExtra(idUsuario, { telefono, consentimientoRF }) {
    const [result] = await db.query(
      `
      INSERT INTO perfiles (
        idUsuario,
        telefono,
        consentimientoRF
      )
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        telefono = VALUES(telefono),
        consentimientoRF = VALUES(consentimientoRF),
        updated_at = CURRENT_TIMESTAMP,
        deleted_at = NULL,
        deleted_by = NULL
      `,
      [
        idUsuario,
        telefono || null,
        consentimientoRF ? 1 : 0,
      ]
    );

    return result;
  },

  async softDelete(idUsuario, deletedBy = null) {
    const [result] = await db.query(
      `
      UPDATE usuarios
      SET
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
      [deletedBy, idUsuario]
    );

    return result;
  },
};