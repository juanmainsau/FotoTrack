// src/services/album.service.js
import { albumRepository } from "../repositories/album.repository.js";

export const albumService = {
  /**
   * ADMIN — lista todos los álbumes
   * (incluye archivados, publicados, borradores)
   */
  async listAlbums() {
    return await albumRepository.getAll(); // ahora devuelve miniatura y totalFotos
  },

  /**
   * USER — lista solo álbumes visibles públicamente
   */
  async listPublicAlbums() {
    const all = await albumRepository.getAll();

    // Solo los que realmente deben verse en el lado cliente
    return all.filter(
      (a) =>
        a.estado?.toLowerCase() === "publicado" &&
        a.visibilidad?.toLowerCase() === "público"
    );
  },

  /**
   * Crear un álbum simple
   */
  async createAlbum(data) {
    const { nombreEvento, fechaEvento } = data;

    if (!nombreEvento || !fechaEvento) {
      throw new Error("Faltan datos obligatorios del álbum (nombre y fecha).");
    }

    // Convertir fecha ISO → YYYY-MM-DD
    const fechaMySQL = fechaEvento.split("T")[0];

    // Normalizar precios
    const precioFoto =
      data.precioFoto !== undefined &&
      data.precioFoto !== null &&
      data.precioFoto !== ""
        ? Number(data.precioFoto)
        : null;

    const precioAlbum =
      data.precioAlbum !== undefined &&
      data.precioAlbum !== null &&
      data.precioAlbum !== ""
        ? Number(data.precioAlbum)
        : null;

    if (Number.isNaN(precioFoto) || Number.isNaN(precioAlbum)) {
      throw new Error("Los precios deben ser numéricos.");
    }

    return await albumRepository.create({
      ...data,
      fechaEvento: fechaMySQL,
      precioFoto,
      precioAlbum,
    });
  },

  /** Obtener un álbum por ID */
  async getAlbumById(idAlbum) {
    return await albumRepository.findById(idAlbum);
  },

  /** Soft delete */
  async eliminarAlbum(idAlbum) {
    return await albumRepository.eliminarAlbum(idAlbum);
  },

  /** Actualizar álbum */
  async actualizarAlbum(idAlbum, data) {
    const { nombreEvento, fechaEvento } = data;

    if (!nombreEvento || !fechaEvento) {
      throw new Error("Faltan datos obligatorios del álbum (nombre y fecha).");
    }

    const fechaMySQL = fechaEvento.includes("T")
      ? fechaEvento.split("T")[0]
      : fechaEvento;

    const precioFoto =
      data.precioFoto !== undefined &&
      data.precioFoto !== null &&
      data.precioFoto !== ""
        ? Number(data.precioFoto)
        : null;

    const precioAlbum =
      data.precioAlbum !== undefined &&
      data.precioAlbum !== null &&
      data.precioAlbum !== ""
        ? Number(data.precioAlbum)
        : null;

    if (Number.isNaN(precioFoto) || Number.isNaN(precioAlbum)) {
      throw new Error("Los precios deben ser numéricos.");
    }

    return await albumRepository.actualizarAlbum(idAlbum, {
      ...data,
      fechaEvento: fechaMySQL,
      precioFoto,
      precioAlbum,
    });
  },
};
