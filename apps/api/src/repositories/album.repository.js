import { db } from "../config/db.js";

export const albumRepository = {
  async getAllAdmin() {
    const [rows] = await db.query(`
      SELECT
        a.idAlbum,
        a.nombreEvento,
        a.fechaEvento,
        a.localizacion,
        a.descripcion,
        a.precioFoto,
        a.precioAlbum,
        er.nombre AS estado,
        va.nombre AS visibilidad,
        a.tags,
        a.codigoInterno,
        a.fechaCarga,
        a.deleted_at,
        COUNT(i.idImagen) AS totalFotos,
        MAX(i.rutaMiniatura) AS miniatura
      FROM album a
      INNER JOIN estados_registro er ON er.idEstadoRegistro = a.idEstadoRegistro
      INNER JOIN visibilidades_album va ON va.idVisibilidad = a.idVisibilidad
      LEFT JOIN imagenes i 
        ON i.idAlbum = a.idAlbum
       AND i.deleted_at IS NULL
      GROUP BY a.idAlbum
      ORDER BY a.fechaEvento DESC, a.idAlbum DESC
    `);

    return rows;
  },

  async getAllPublic() {
    const [rows] = await db.query(`
      SELECT
        a.idAlbum,
        a.nombreEvento,
        a.fechaEvento,
        a.localizacion,
        a.descripcion,
        a.precioFoto,
        a.precioAlbum,
        er.nombre AS estado,
        va.nombre AS visibilidad,
        a.tags,
        a.codigoInterno,
        a.fechaCarga,
        COUNT(i.idImagen) AS totalFotos,
        MAX(i.rutaMiniatura) AS miniatura
      FROM album a
      INNER JOIN estados_registro er ON er.idEstadoRegistro = a.idEstadoRegistro
      INNER JOIN visibilidades_album va ON va.idVisibilidad = a.idVisibilidad
      LEFT JOIN imagenes i 
        ON i.idAlbum = a.idAlbum
       AND i.deleted_at IS NULL
      WHERE a.deleted_at IS NULL
        AND er.nombre = 'activo'
        AND va.nombre = 'publico'
      GROUP BY a.idAlbum
      ORDER BY a.fechaEvento DESC, a.idAlbum DESC
    `);

    return rows;
  },

  async getAll() {
    return this.getAllAdmin();
  },

  async create(data) {
    const {
      nombreEvento,
      fechaEvento,
      localizacion = null,
      descripcion = null,
      precioFoto = null,
      precioAlbum = null,
      estado = "activo",
      visibilidad = "publico",
      tags = null,
      codigoInterno = null,
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO album (
        nombreEvento,
        fechaEvento,
        localizacion,
        descripcion,
        precioFoto,
        precioAlbum,
        idEstadoRegistro,
        idVisibilidad,
        tags,
        codigoInterno
      )
      VALUES (
        ?, ?, ?, ?, ?, ?,
        (SELECT idEstadoRegistro FROM estados_registro WHERE nombre = ? LIMIT 1),
        (SELECT idVisibilidad FROM visibilidades_album WHERE nombre = ? LIMIT 1),
        ?, ?
      )
      `,
      [
        nombreEvento,
        fechaEvento,
        localizacion,
        descripcion,
        precioFoto,
        precioAlbum,
        estado,
        visibilidad,
        tags,
        codigoInterno,
      ]
    );

    return { idAlbum: result.insertId };
  },

  async updateCodigoInterno(idAlbum, codigoInterno) {
    await db.query(
      `
      UPDATE album
      SET codigoInterno = ?
      WHERE idAlbum = ?
        AND deleted_at IS NULL
      `,
      [codigoInterno, idAlbum]
    );
  },

  async findById(idAlbum, includeDeleted = false) {
    const [rows] = await db.query(
      `
      SELECT
        a.idAlbum,
        a.nombreEvento,
        a.fechaEvento,
        a.localizacion,
        a.descripcion,
        a.precioFoto,
        a.precioAlbum,
        er.nombre AS estado,
        va.nombre AS visibilidad,
        a.tags,
        a.codigoInterno,
        a.fechaCarga,
        a.deleted_at,
        COUNT(i.idImagen) AS totalFotos,
        MAX(i.rutaMiniatura) AS miniatura
      FROM album a
      INNER JOIN estados_registro er ON er.idEstadoRegistro = a.idEstadoRegistro
      INNER JOIN visibilidades_album va ON va.idVisibilidad = a.idVisibilidad
      LEFT JOIN imagenes i 
        ON i.idAlbum = a.idAlbum
       AND i.deleted_at IS NULL
      WHERE a.idAlbum = ?
        ${includeDeleted ? "" : "AND a.deleted_at IS NULL"}
      GROUP BY a.idAlbum
      `,
      [idAlbum]
    );

    return rows[0] || null;
  },

  async actualizarAlbum(idAlbum, data) {
    const {
      nombreEvento,
      fechaEvento,
      localizacion,
      descripcion,
      precioFoto = null,
      precioAlbum = null,
      estado = "activo",
      visibilidad = "publico",
      tags = null,
    } = data;

    const [result] = await db.query(
      `
      UPDATE album
      SET
        nombreEvento = ?,
        fechaEvento = ?,
        localizacion = ?,
        descripcion = ?,
        precioFoto = ?,
        precioAlbum = ?,
        idEstadoRegistro = (
          SELECT idEstadoRegistro 
          FROM estados_registro 
          WHERE nombre = ? 
          LIMIT 1
        ),
        idVisibilidad = (
          SELECT idVisibilidad 
          FROM visibilidades_album 
          WHERE nombre = ? 
          LIMIT 1
        ),
        tags = ?
      WHERE idAlbum = ?
        AND deleted_at IS NULL
      `,
      [
        nombreEvento,
        fechaEvento,
        localizacion,
        descripcion,
        precioFoto,
        precioAlbum,
        estado,
        visibilidad,
        tags,
        idAlbum,
      ]
    );

    return result;
  },

  async softDelete(idAlbum, deletedBy = null) {
    const [result] = await db.query(
      `
      UPDATE album
      SET
        idEstadoRegistro = (
          SELECT idEstadoRegistro 
          FROM estados_registro 
          WHERE nombre = 'eliminado' 
          LIMIT 1
        ),
        deleted_at = NOW(),
        deleted_by = ?
      WHERE idAlbum = ?
        AND deleted_at IS NULL
      `,
      [deletedBy, idAlbum]
    );

    return result;
  },

  async eliminarAlbum(idAlbum, deletedBy = null) {
    return this.softDelete(idAlbum, deletedBy);
  },

  async deleteHard(idAlbum, deletedBy = null) {
    return this.softDelete(idAlbum, deletedBy);
  },
};