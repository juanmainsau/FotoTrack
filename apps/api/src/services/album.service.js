import { albumRepository } from "../repositories/album.repository.js";

function normalizeFecha(fechaEvento) {
  if (!fechaEvento) return null;
  return String(fechaEvento).includes("T")
    ? String(fechaEvento).split("T")[0]
    : fechaEvento;
}

function normalizePrecio(value) {
  if (value === undefined || value === null || value === "") return null;

  const numberValue = Number(value);
  if (Number.isNaN(numberValue) || numberValue < 0) {
    throw new Error("Los precios deben ser numéricos y no negativos.");
  }

  return numberValue;
}

function normalizeVisibilidad(value) {
  if (!value) return "publico";

  const normalized = String(value).trim().toLowerCase();

  if (normalized === "público") return "publico";
  if (normalized === "publico") return "publico";
  if (normalized === "privado") return "privado";
  if (normalized === "oculto") return "oculto";

  return "publico";
}

function normalizeEstado(value) {
  if (!value) return "activo";

  const normalized = String(value).trim().toLowerCase();

  if (normalized === "publicado") return "activo";
  if (normalized === "activo") return "activo";
  if (normalized === "borrador") return "inactivo";
  if (normalized === "inactivo") return "inactivo";
  if (normalized === "oculto") return "inactivo";
  if (normalized === "archivado") return "inactivo";
  if (normalized === "eliminado") return "eliminado";
  if (normalized === "pendiente") return "pendiente";
  
  return "activo";
}

export const albumService = {
  async listAlbums() {
    return await albumRepository.getAll();
  },

  async listPublicAlbums() {
    return await albumRepository.getAllPublic();
  },

  async getAlbumById(idAlbum, options = {}) {
    return await albumRepository.findById(idAlbum, options.includeDeleted || false);
  },

  async createAlbum(data) {
    const nombreEvento = data.nombreEvento?.trim();
    const fechaEvento = normalizeFecha(data.fechaEvento);

    if (!nombreEvento || !fechaEvento) {
      throw new Error("Faltan datos obligatorios del álbum: nombre y fecha.");
    }

    const precioFoto = normalizePrecio(data.precioFoto);
    const precioAlbum = normalizePrecio(data.precioAlbum);

    return await albumRepository.create({
      nombreEvento,
      fechaEvento,
      localizacion: data.localizacion || null,
      descripcion: data.descripcion || null,
      precioFoto,
      precioAlbum,
      estado: normalizeEstado(data.estado),
      visibilidad: normalizeVisibilidad(data.visibilidad),
      tags: data.tags || null,
      codigoInterno: data.codigoInterno || null,
    });
  },

  async actualizarAlbum(idAlbum, data) {
    const actual = await albumRepository.findById(idAlbum);

    if (!actual) {
      throw new Error("El álbum no existe o fue eliminado.");
    }

    const fechaEvento = data.fechaEvento
      ? normalizeFecha(data.fechaEvento)
      : normalizeFecha(actual.fechaEvento);

    const precioFoto =
      data.precioFoto !== undefined ? normalizePrecio(data.precioFoto) : actual.precioFoto;

    const precioAlbum =
      data.precioAlbum !== undefined ? normalizePrecio(data.precioAlbum) : actual.precioAlbum;

    const merge = {
      nombreEvento: data.nombreEvento?.trim() || actual.nombreEvento,
      fechaEvento,
      localizacion:
        data.localizacion !== undefined ? data.localizacion || null : actual.localizacion,
      descripcion:
        data.descripcion !== undefined ? data.descripcion || null : actual.descripcion,
      precioFoto,
      precioAlbum,
      estado: normalizeEstado(data.estado || actual.estado),
      visibilidad: normalizeVisibilidad(data.visibilidad || actual.visibilidad),
      tags: data.tags !== undefined ? data.tags || null : actual.tags,
    };

    return await albumRepository.actualizarAlbum(idAlbum, merge);
  },

  async softDeleteAlbum(idAlbum, deletedBy = null) {
    const actual = await albumRepository.findById(idAlbum);

    if (!actual) {
      throw new Error("El álbum no existe o ya fue eliminado.");
    }

    return await albumRepository.softDelete(idAlbum, deletedBy);
  },

  async deleteAlbumHard(idAlbum, deletedBy = null) {
    return await this.softDeleteAlbum(idAlbum, deletedBy);
  },
};