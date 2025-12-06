// apps/web/src/api/cart.js
import { authFetch } from "./authFetch";

const API_URL = "http://localhost:4000/api/carrito";

// =====================================================
// ⭐ AGREGAR UNA IMAGEN AL CARRITO (BACKEND OFICIAL)
// =====================================================
export async function addImageToCart(idImagen) {
  const res = await authFetch(`${API_URL}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idImagen }),
  });

  // Manejo de error mejorado: mostramos el error real del backend
  if (!res.ok) {
    let backendError = null;

    try {
      backendError = await res.json();
      console.error("🔥 Error del backend (addImageToCart):", backendError);
    } catch (err) {
      console.error("🔥 Error desconocido del backend en addImageToCart");
    }

    throw new Error(backendError?.error || "No se pudo agregar la imagen al carrito");
  }

  return await res.json().catch(() => ({}));
}

// =====================================================
// ⭐ OBTENER MI CARRITO
// =====================================================
export async function getMyCart() {
  const res = await authFetch(`${API_URL}/mio`);

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

// =====================================================
// ⭐ ELIMINAR ITEM DEL CARRITO
// =====================================================
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

// =====================================================
// ⭐ VACIAR MI CARRITO
// =====================================================
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

// =====================================================
// ⭐ AGREGAR ÁLBUM COMPLETO (FRONTEND)
// Tu backend NO tiene endpoint oficial, por eso agregamos foto por foto
// =====================================================
export async function addAlbumToCart(idAlbum) {
  const res = await authFetch(
    `http://localhost:4000/api/imagenes/album/${idAlbum}`
  );

  if (!res.ok) {
    let backendError = null;
    try {
      backendError = await res.json();
      console.error("🔥 Error del backend (addAlbumToCart - obtener imágenes):", backendError);
    } catch {}
    throw new Error(backendError?.error || "No se pudieron obtener imágenes del álbum");
  }

  const imagenes = await res.json();

  if (!imagenes.length) {
    throw new Error("El álbum no contiene imágenes");
  }

  // Agregar cada imagen individualmente
  for (const img of imagenes) {
    await addImageToCart(img.idImagen);
  }

  return {
    ok: true,
    count: imagenes.length,
    message: "Álbum agregado al carrito",
  };
}
