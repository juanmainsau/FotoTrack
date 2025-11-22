import { albumRepository } from "../repositories/album.repository.js";

export const albumService = {

  async listAlbums() {
    return await albumRepository.getAll();
  },

  async createAlbum(data) {
    if (!data.nombreEvento || !data.fechaEvento || !data.localizacion) {
      throw new Error("Faltan datos obligatorios del álbum.");
    }

    return await albumRepository.create(data);
  },

  async getAlbumById(idAlbum) {
    return await albumRepository.findById(idAlbum);
  },

  async eliminarAlbum(idAlbum) {
    return await albumRepository.eliminarAlbum(idAlbum);
  },

  async actualizarAlbum(idAlbum, data) {
    return await albumRepository.actualizarAlbum(idAlbum, data);
  }
};
