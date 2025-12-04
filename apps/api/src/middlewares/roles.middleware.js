// src/middlewares/roles.middleware.js
export function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "No autenticado" });
    }

    if (req.user.rol !== "admin") {
      return res.status(403).json({ 
        ok: false, 
        error: "Acceso denegado: se requiere rol ADMIN" 
      });
    }

    next();
  } catch (err) {
    console.error("Error en requireAdmin:", err);
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}
