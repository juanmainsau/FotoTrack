// src/repositories/album.repository.js
import { db } from "../config/db.js";

export const albumRepository = {

  /**
   * ADMIN → Obtiene TODOS los álbumes sin filtro
   */
  async getAllAdmin() {
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
        a.estado,
        a.visibilidad,
        a.tags,
        a.codigoInterno,
        a.fechaCarga,
        COUNT(i.idImagen)        AS totalFotos,
        MAX(i.rutaMiniatura)     AS miniatura
      FROM album a
      LEFT JOIN imagenes i ON i.idAlbum = a.idAlbum
      GROUP BY a.idAlbum
      ORDER BY a.fechaEvento DESC, a.idAlbum DESC
      `
    );
    return rows;
  },

  /**
   * USUARIO → Solo álbumes ACTIVO + PÚBLICO
   */
  async getAllPublic() {
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
        a.estado,
        a.visibilidad,
        a.tags,
        a.codigoInterno,
        a.fechaCarga,
        COUNT(i.idImagen)        AS totalFotos,
        MAX(i.rutaMiniatura)     AS miniatura
      FROM album a
      LEFT JOIN imagenes i ON i.idAlbum = a.idAlbum
      WHERE a.estado = 'publicado'
        AND a.visibilidad = 'Público'
      GROUP BY a.idAlbum
      ORDER BY a.fechaEvento DESC, a.idAlbum DESC
      `
    );
    return rows;
  },

  /**
   * 🔥 FUNCIÓN FALTANTE → usada por albumService.listAlbums()
   */
  async getAll() {
    // Por compatibilidad, devolvemos lo mismo que getAllAdmin()
    return this.getAllAdmin();
  },

  async create(data) {
    const {
      nombreEvento,
      fechaEvento,
      localizacion,
      descripcion,
      precioFoto = null,
      precioAlbum = null,
      estado = "activo",
      visibilidad = "Público",
      tags = null,
      codigoInterno = null,
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO album (
        nombreEvento, fechaEvento, localizacion, descripcion,
        precioFoto, precioAlbum, estado, visibilidad, tags, codigoInterno
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  async findById(idAlbum) {
    const [rows] = await db.query(
      `
      SELECT
        a.*,
        COUNT(i.idImagen)    AS totalFotos,
        MAX(i.rutaMiniatura) AS miniatura
      FROM album a
      LEFT JOIN imagenes i ON i.idAlbum = a.idAlbum
      WHERE a.idAlbum = ?
      GROUP BY a.idAlbum
      `,
      [idAlbum]
    );

    return rows[0] || null;
  },

  /**
   * Borrado Lógico (Legacy)
   * Lo dejamos por si en algún momento quieres solo archivar.
   */
  async eliminarAlbum(idAlbum) {
    await db.query(
      `
      UPDATE album
      SET estado = 'archivado'
      WHERE idAlbum = ?
      `,
      [idAlbum]
    );
  },

  /**
   * 🗑️ BORRADO FÍSICO (Hard Delete)
   * Elimina el registro de la BD para siempre.
   * Se debe llamar DESPUÉS de limpiar Cloudinary en el servicio.
   */
  async deleteHard(idAlbum) {
    // 1. Borrar items del carrito relacionados (para evitar error de Foreign Key)
    await db.query("DELETE FROM items_carrito WHERE idAlbum = ?", [idAlbum]);
    
    // 2. Borrar las imágenes de la tabla imagenes
    await db.query("DELETE FROM imagenes WHERE idAlbum = ?", [idAlbum]);

    // 3. Borrar el álbum
    const [result] = await db.query("DELETE FROM album WHERE idAlbum = ?", [idAlbum]);
    return result;
  },

  /**
   * ✏️ ACTUALIZAR
   */
  async actualizarAlbum(idAlbum, data) {
    const {
      nombreEvento,
      fechaEvento,
      localizacion,
      descripcion,
      precioFoto = null,
      precioAlbum = null,
      estado,
      visibilidad,
      tags,
    } = data;

    await db.query(
      `
      UPDATE album
      SET
        nombreEvento = ?,
        fechaEvento = ?,
        localizacion = ?,
        descripcion = ?,
        precioFoto = ?,
        precioAlbum = ?,
        estado = ?,
        visibilidad = ?,
        tags = ?
      WHERE idAlbum = ?
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
  },
};