// apps/api/src/repositories/album.repository.js
import { db } from "../config/db.js";

export async function getAllAlbums() {
  const tableCandidates = ["album", "ALBUMES", "Album", "albums"];

  const sqlFields = `
    idAlbum,
    nombreEvento,
    fechaEvento,
    localizacion,
    descripcion,
    estado,
    fechaCarga
  `;

  for (const table of tableCandidates) {
    try {
      const [rows] = await db.query(`SELECT ${sqlFields} FROM ${table} ORDER BY fechaEvento DESC`);
      return rows;
    } catch (err) {
      // si la tabla no existe, probamos el siguiente candidato
      const msg = String(err.message || "").toLowerCase();
      if (msg.includes("doesn't exist") || msg.includes('does not exist') || msg.includes('unknown table')) {
        continue;
      }
      // si es otro error, re-lanzamos
      throw err;
    }
  }

  // Si ninguna tabla existe, lanzar error descriptivo
  throw new Error("No se encontró la tabla de álbumes en la base de datos (buscadas: album, ALBUMES, Album, albums)");
}

export async function createAlbum({
  nombreEvento,
  fechaEvento,
  localizacion,
  descripcion,
  estado = "activo",
}) {
  const insertCandidates = ["album", "ALBUMES", "Album", "albums"];

  for (const table of insertCandidates) {
    try {
      const [result] = await db.query(
        `INSERT INTO ${table} (nombreEvento, fechaEvento, localizacion, descripcion, estado) VALUES (?, ?, ?, ?, ?)`,
        [nombreEvento, fechaEvento, localizacion, descripcion, estado]
      );

      return { idAlbum: result.insertId };
    } catch (err) {
      const msg = String(err.message || "").toLowerCase();
      if (msg.includes("doesn't exist") || msg.includes('does not exist') || msg.includes('unknown table')) {
        continue;
      }
      throw err;
    }
  }

  throw new Error("No se pudo insertar el álbum: ninguna tabla de álbumes encontrada.");
}
