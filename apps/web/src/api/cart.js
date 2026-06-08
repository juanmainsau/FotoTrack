// apps/web/src/api/cart.js
import { authFetch } from "./authFetch";

const API_URL = "http://localhost:4000/api/carrito";

export async function addImageToCart(idImagen) {
  const res = await authFetch(`${API_URL}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idImagen }),
  });

  if (!res.ok) {
    let backendError = null;

    try {
      backendError = await res.json();
      console.error("🔥 Error del backend (addImageToCart):", backendError);
    } catch {}

    throw new Error(
      backendError?.error || "No se pudo agregar la imagen al carrito"
    );
  }

  return await res.json().catch(() => ({}));
}

export async function getMyCart() {
  const res = await authFetch(`${API_URL}/mio?t=${Date.now()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    let backendError = null;

    try {
      backendError = await res.json();
      console.error("🔥 Error del backend (getMyCart):", backendError);
    } catch {}

    throw new Error(backendError?.error || "No se pudo obtener el carrito");
  }

  return await res.json();
}

export async function removeItem(idItem) {
  const res = await authFetch(`${API_URL}/item/${idItem}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let backendError = null;

    try {
      backendError = await res.json();
      console.error("🔥 Error del backend (removeItem):", backendError);
    } catch {}

    throw new Error(backendError?.error || "No se pudo eliminar el item");
  }

  return await res.json().catch(() => ({}));
}

export async function clearCart() {
  const res = await authFetch(`${API_URL}/mio`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let backendError = null;

    try {
      backendError = await res.json();
      console.error("🔥 Error del backend (clearCart):", backendError);
    } catch {}

    throw new Error(backendError?.error || "No se pudo vaciar el carrito");
  }

  return await res.json().catch(() => ({}));
}

export async function addAlbumToCart(idAlbum) {
  const res = await authFetch(
    `http://localhost:4000/api/imagenes/album/${idAlbum}?t=${Date.now()}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    let backendError = null;

    try {
      backendError = await res.json();
      console.error(
        "🔥 Error del backend (addAlbumToCart - obtener imágenes):",
        backendError
      );
    } catch {}

    throw new Error(
      backendError?.error || "No se pudieron obtener imágenes del álbum"
    );
  }

  const data = await res.json();

  const imagenes = data.ok
    ? data.imagenes || []
    : Array.isArray(data)
    ? data
    : [];

  if (!imagenes.length) {
    throw new Error("El álbum no contiene imágenes");
  }

  let agregadas = 0;
  let duplicadas = 0;

  for (const img of imagenes) {
    try {
      await addImageToCart(img.idImagen);
      agregadas++;
    } catch (err) {
      if (String(err.message).toLowerCase().includes("ya está")) {
        duplicadas++;
        continue;
      }

      throw err;
    }
  }

  return {
    ok: true,
    count: agregadas,
    duplicadas,
    message:
      duplicadas > 0
        ? `Álbum agregado parcialmente. ${duplicadas} fotos ya estaban en el carrito.`
        : "Álbum agregado al carrito",
  };
}