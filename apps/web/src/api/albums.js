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

// GET — obtener álbumes
export async function fetchAlbums() {
  const response = await fetch(`${API_URL}/albums`);

  if (!response.ok) {
    throw new Error("Error al obtener álbumes");
  }

  return response.json();
}

// DELETE — eliminar álbum
export async function deleteAlbum(idAlbum) {
  const res = await fetch(`${API_URL}/albums/${idAlbum}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al eliminar álbum");
  }

  return res.json();
}
