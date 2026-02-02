// src/repositories/image.repository.js
import { db } from "../config/db.js";

export const imageRepository = {
  
  // ⭐ ACTUALIZADO: Recibe y guarda los 3 IDs de Cloudinary
  async create(data) {
    const {
      idAlbum,
      rutaOriginal,
      rutaMiniatura,
      rutaOptimizado,
      public_id,           // ID Original (ya existía)
      public_id_thumb,     // ID Miniatura (NUEVO)
      public_id_optimized  // ID Optimizada (NUEVO)
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO imagenes 
      (idAlbum, rutaOriginal, rutaMiniatura, rutaOptimizado, public_id, public_id_thumb, public_id_optimized)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        idAlbum,
        rutaOriginal,
        rutaMiniatura,
        rutaOptimizado,
        public_id,
        public_id_thumb,
        public_id_optimized
      ]
    );

    return { idImagen: result.insertId, ...data };
  },

  // Los métodos de lectura se mantienen igual (SELECT * traerá las nuevas columnas automáticamente)
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