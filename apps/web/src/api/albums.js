// src/api/albums.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function fetchAlbums() {
  const response = await fetch(`${API_URL}/albums`);
  if (!response.ok) {
    throw new Error("Error al obtener álbumes");
  }
  return response.json();
}
