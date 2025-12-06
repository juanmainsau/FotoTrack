export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("fototrack-token"); // 👈 CLAVE REAL

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.warn("Sesión expirada o token inválido.");
  }

  return response;
}
