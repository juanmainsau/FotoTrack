// src/api/albums.js

const raw = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Normalizar: asegurarse que la URL base incluye '/api' al final
const API_URL = raw.endsWith('/api') ? raw : raw.replace(/\/+$/, '') + '/api';

export async function fetchAlbums() {
  const response = await fetch(`${API_URL}/albums`);
  if (!response.ok) {
    throw new Error("Error al obtener álbumes");
  }
  return response.json();
}
