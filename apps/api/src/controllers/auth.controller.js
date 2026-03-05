// src/controllers/auth.controller.js
import { userRepository } from "../repositories/user.repository.js";
import { db } from "../config/db.js";

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
          cuit: user.cuit, // 👈 NUEVO: Devolvemos el CUIT a la vista de perfil
          rol: user.rol,
          foto: user.foto,
          foto_referencia: user.foto_referencia,
          estado: user.estado,
        },
      });
    } catch (err) {
      console.error("Error en /auth/me:", err);
      return res.status(500).json({ ok: false, error: "Error al obtener usuario" });
    }
  },

  // ⭐ NUEVO: Función para actualizar datos del perfil (Nombre y CUIT)
  async updateProfile(req, res) {
    try {
      const idUsuario = req.user?.idUsuario || req.user?.id;
      const { nombre, cuit } = req.body; // 👈 Ahora atrapamos también el cuit

      if (!idUsuario) {
        return res.status(401).json({ ok: false, error: "Usuario no autenticado." });
      }

      if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ ok: false, error: "El nombre debe tener al menos 3 caracteres." });
      }

      // 👈 Actualizamos la consulta para guardar ambos campos (Nombre y CUIT)
      const [result] = await db.query(
        "UPDATE usuarios SET nombre = ?, cuit = ? WHERE idUsuario = ?", 
        [nombre.trim(), cuit?.trim() || null, idUsuario]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "Usuario no encontrado." });
      }

      return res.json({ ok: true, mensaje: "Perfil actualizado correctamente." });

    } catch (error) {
      console.error("❌ Error en updateProfile:", error);
      return res.status(500).json({ ok: false, error: "Error interno al actualizar el perfil." });
    }
  },

  // Función para subir la selfie de reconocimiento facial
  async uploadSelfie(req, res) {
    try {
      const idUsuario = req.user?.idUsuario || req.user?.id;

      if (!req.file) {
        return res.status(400).json({ ok: false, error: "No se recibió ninguna imagen." });
      }

      const photoUrl = `/uploads/selfies/${req.file.filename}`;

      const [result] = await db.query(
        "UPDATE usuarios SET foto_referencia = ? WHERE idUsuario = ?", 
        [photoUrl, idUsuario]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "Usuario no encontrado." });
      }

      console.log(`📸 Selfie guardada para el usuario ID: ${idUsuario}`);
      
      return res.json({ 
        ok: true, 
        mensaje: "Selfie guardada con éxito",
        url: photoUrl
      });

    } catch (error) {
      console.error("❌ Error en uploadSelfie:", error);
      return res.status(500).json({ ok: false, error: "Error interno al guardar la selfie." });
    }
  }
};