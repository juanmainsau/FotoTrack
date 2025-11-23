// src/repositories/user.repository.js
import { db } from "../config/db.js";

export const userRepository = {
  async findByEmail(correo) {
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );
    return rows[0] || null;
  },

  async findByFirebaseUid(firebaseUid) {
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE firebase_uid = ? LIMIT 1",
      [firebaseUid]
    );
    return rows[0] || null;
  },

  async createTraditionalUser({ correo, passwordHash }) {
    const [result] = await db.query(
      `
      INSERT INTO usuarios (correo, contrasena, rol)
      VALUES (?, ?, ?)
      `,
      [correo, passwordHash, "cliente"]
    );

    return {
      id: result.insertId,
      correo,
      rol: "cliente",
    };
  },

  async createGoogleUser({ firebaseUid, correo, nombre }) {
    const [result] = await db.query(
      `
      INSERT INTO usuarios (firebase_uid, correo, nombre, rol)
      VALUES (?, ?, ?, ?)
      `,
      [firebaseUid, correo, nombre || "", "cliente"]
    );

    return {
      id: result.insertId,
      firebase_uid: firebaseUid,
      correo,
      nombre: nombre || "",
      rol: "cliente",
    };
  },

  async linkGoogleAccountByEmail({ firebaseUid, correo }) {
    await db.query(
      `
      UPDATE usuarios
      SET firebase_uid = ?
      WHERE correo = ?
      `,
      [firebaseUid, correo]
    );

    return this.findByEmail(correo);
  },
};
