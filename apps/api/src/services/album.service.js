// apps/api/src/services/album.service.js
import * as AlbumRepo from "../repositories/album.repository.js";

export async function listarAlbums() {
  return await AlbumRepo.getAllAlbums();
}

export async function crearAlbum(datos) {
  return await AlbumRepo.createAlbum(datos);
}
