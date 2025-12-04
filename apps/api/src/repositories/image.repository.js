// src/repositories/image.repository.js
import { db } from "../config/db.js";

export const imageRepository = {
  async create({ idAlbum, rutaOriginal, rutaMiniatura, rutaOptimizado, public_id }) {
    const [result] = await db.query(
      `
      INSERT INTO imagenes (idAlbum, rutaOriginal, rutaMiniatura, rutaOptimizado, public_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [idAlbum, rutaOriginal, rutaMiniatura, rutaOptimizado, public_id]
    );

    return { idImagen: result.insertId };
  },

  async getByAlbum(idAlbum) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM imagenes
      WHERE idAlbum = ?
      ORDER BY idImagen DESC
      `,
      [idAlbum]
    );

    return rows;
  },

  async getImageById(idImagen) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM imagenes
      WHERE idImagen = ?
      LIMIT 1
      `,
      [idImagen]
    );
    return rows[0];
  },

  async deleteImageById(idImagen) {
    await db.query(
      `
      DELETE FROM imagenes
      WHERE idImagen = ?
      `,
      [idImagen]
    );
  },
};
