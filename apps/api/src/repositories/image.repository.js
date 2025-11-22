// src/repositories/image.repository.js
import { db } from "../config/db.js";

export const imageRepository = {
  async create({ idAlbum, nombreArchivo, rutaOriginal, rutaProcesada, rutaMiniatura }) {
    const [result] = await db.query(
      `
      INSERT INTO imagenes (idAlbum, nombreArchivo, rutaOriginal, rutaProcesada, rutaMiniatura)
      VALUES (?, ?, ?, ?, ?)
      `,
      [idAlbum, nombreArchivo, rutaOriginal, rutaProcesada, rutaMiniatura]
    );

    return { idImagen: result.insertId };
  },


  async getByAlbum(idAlbum) {
    const [rows] = await db.query(
      `
      SELECT * FROM imagenes
      WHERE idAlbum = ?
      ORDER BY idImagen DESC
      `,
      [idAlbum]
    );

    return rows;
  }
};
