import { db } from "../config/db.js";

export const imageRepository = {
  async create(data) {
    const {
      idAlbum,
      rutaOriginal,
      rutaMiniatura,
      rutaOptimizado,
      public_id = null,
      public_id_thumb = null,
      public_id_optimized = null,
      estado = "activo",
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO imagenes (
        idAlbum,
        idEstadoRegistro,
        rutaOriginal,
        rutaMiniatura,
        rutaOptimizado,
        public_id,
        public_id_thumb,
        public_id_optimized
      )
      VALUES (
        ?,
        (SELECT idEstadoRegistro FROM estados_registro WHERE nombre = ? LIMIT 1),
        ?, ?, ?, ?, ?, ?
      )
      `,
      [
        idAlbum,
        estado,
        rutaOriginal,
        rutaMiniatura,
        rutaOptimizado,
        public_id,
        public_id_thumb,
        public_id_optimized,
      ]
    );

    return {
      idImagen: result.insertId,
      ...data,
    };
  },

  async getByAlbum(idAlbum, includeDeleted = false) {
    const [rows] = await db.query(
      `
      SELECT
        i.idImagen,
        i.idAlbum,
        i.rutaOriginal,
        i.rutaMiniatura,
        i.rutaOptimizado,
        i.public_id,
        i.public_id_thumb,
        i.public_id_optimized,
        i.fechaCarga,
        i.deleted_at,
        er.nombre AS estado
      FROM imagenes i
      INNER JOIN estados_registro er ON er.idEstadoRegistro = i.idEstadoRegistro
      WHERE i.idAlbum = ?
        ${includeDeleted ? "" : "AND i.deleted_at IS NULL"}
      ORDER BY i.idImagen DESC
      `,
      [idAlbum]
    );

    return rows;
  },

  async getImageById(idImagen, includeDeleted = false) {
    const [rows] = await db.query(
      `
      SELECT
        i.idImagen,
        i.idAlbum,
        i.rutaOriginal,
        i.rutaMiniatura,
        i.rutaOptimizado,
        i.public_id,
        i.public_id_thumb,
        i.public_id_optimized,
        i.fechaCarga,
        i.deleted_at,
        er.nombre AS estado
      FROM imagenes i
      INNER JOIN estados_registro er ON er.idEstadoRegistro = i.idEstadoRegistro
      WHERE i.idImagen = ?
        ${includeDeleted ? "" : "AND i.deleted_at IS NULL"}
      LIMIT 1
      `,
      [idImagen]
    );

    return rows[0] || null;
  },

  async softDeleteImageById(idImagen, deletedBy = null) {
    const [result] = await db.query(
      `
      UPDATE imagenes
      SET
        idEstadoRegistro = (
          SELECT idEstadoRegistro
          FROM estados_registro
          WHERE nombre = 'eliminado'
          LIMIT 1
        ),
        deleted_at = NOW(),
        deleted_by = ?
      WHERE idImagen = ?
        AND deleted_at IS NULL
      `,
      [deletedBy, idImagen]
    );

    return result;
  },

  async deleteImageById(idImagen, deletedBy = null) {
    return this.softDeleteImageById(idImagen, deletedBy);
  },
};