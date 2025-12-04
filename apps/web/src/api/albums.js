// Construir URL base robusta
function buildBaseUrl() {
  let base = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Quitar barra final si hay
  if (base.endsWith("/")) base = base.slice(0, -1);

  // Asegurar que termine en "/api"
  if (!base.endsWith("/api")) base = base + "/api";

  return base;
}

const API_URL = buildBaseUrl();

// 🔐 FUNCION AUXILIAR: obtener token
function getAuthHeaders() {
  const token = localStorage.getItem("fototrack-token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

// GET — obtener álbumes
export async function fetchAlbums() {
  const res = await fetch(`${API_URL}/albums`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener álbumes");
  }

  return res.json();
}

// DELETE — eliminar álbum
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

// POST — crear álbum (si lo necesitás acá también)
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
