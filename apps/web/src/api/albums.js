// apps/web/src/api/albums.js

function buildBaseUrl() {
  let base = import.meta.env.VITE_API_URL || "http://localhost:4000";

  if (base.endsWith("/")) base = base.slice(0, -1);

  if (!base.endsWith("/api")) base = base + "/api";

  return base;
}

const API_URL = buildBaseUrl();

function getAuthHeaders() {
  const token = localStorage.getItem("fototrack-token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function fetchAlbums() {
  const res = await fetch(`${API_URL}/albums?t=${Date.now()}`, {
    headers: {
      ...getAuthHeaders(),
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener álbumes");
  }

  return res.json();
}

export async function deleteAlbum(idAlbum) {
  const res = await fetch(`${API_URL}/albums/${idAlbum}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error("Error al eliminar álbum");
  }

  return res.json();
}

export async function createAlbum(formData) {
  const res = await fetch(`${API_URL}/albums`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    throw new Error("Error al crear álbum");
  }

  return res.json();
}