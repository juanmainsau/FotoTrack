// src/controllers/auth.controller.js
import { userRepository } from "../repositories/user.repository.js";

export const authController = {
  async me(req, res) {
    try {
      // El middleware deja req.user con { idUsuario, nombre, correo, rol... }
      const user = await userRepository.findById(req.user.idUsuario);

      if (!user) {
        return res.status(404).json({ ok: false, error: "Usuario no encontrado" });
      }

      return res.json({
        ok: true,
        user: {
          idUsuario: user.idUsuario,
          correo: user.correo,
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.rol,
          foto: user.foto,
          estado: user.estado,
        },
      });
    } catch (err) {
      console.error("Error en /auth/me:", err);
      return res.status(500).json({ ok: false, error: "Error al obtener usuario" });
    }
  },
};
