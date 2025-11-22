// src/repositories/album.repository.js
import { db } from "../config/db.js";

export const albumRepository = {
  async getAll() {
    const [rows] = await db.query("SELECT * FROM album ORDER BY fechaEvento DESC");
    return rows;
  },

  async create({ nombreEvento, fechaEvento, localizacion, descripcion }) {
    const [result] = await db.query(
      `
      INSERT INTO album (nombreEvento, fechaEvento, localizacion, descripcion)
      VALUES (?, ?, ?, ?)
      `,
      [nombreEvento, fechaEvento, localizacion, descripcion]
    );

    return { idAlbum: result.insertId };
  },

  async findById(idAlbum) {
    const [rows] = await db.query(
      `SELECT * FROM album WHERE idAlbum = ?`,
      [idAlbum]
    );
    return rows[0] || null;
  },

  async eliminarAlbum(idAlbum) {
    await db.query("DELETE FROM album WHERE idAlbum = ?", [idAlbum]);
  },

  async actualizarAlbum(idAlbum, data) {
    const { nombreEvento, fechaEvento, localizacion, descripcion } = data;

    await db.query(
      `
      UPDATE album
      SET nombreEvento = ?, fechaEvento = ?, localizacion = ?, descripcion = ?
      WHERE idAlbum = ?
    `,
      [nombreEvento, fechaEvento, localizacion, descripcion, idAlbum]
    );
  }
};
