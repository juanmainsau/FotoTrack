// apps/api/src/repositories/album.repository.js
import { db } from "../config/db.js";

export async function getAllAlbums() {
  const [rows] = await db.query(`
    SELECT 
      idAlbum,
      nombreEvento,
      fechaEvento,
      localizacion,
      descripcion,
      estado,
      fechaCarga
    FROM album
    ORDER BY fechaEvento DESC
  `);

  return rows;
}

export async function createAlbum({
  nombreEvento,
  fechaEvento,
  localizacion,
  descripcion,
  estado = "activo",
}) {
  const [result] = await db.query(
    `INSERT INTO ALBUMES (nombreEvento, fechaEvento, localizacion, descripcion, estado)
     VALUES (?, ?, ?, ?, ?)`,
    [nombreEvento, fechaEvento, localizacion, descripcion, estado]
  );

  return { idAlbum: result.insertId };
}
