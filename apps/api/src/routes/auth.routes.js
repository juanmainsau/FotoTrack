// src/routes/auth.routes.js
import { Router } from "express";
import { authService } from "../services/auth.service.js";

const router = Router();

/**
 * POST /auth/register
 * Registro tradicional: correo + contraseña
 */
router.post("/register", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "Correo y contraseña son obligatorios." });
    }

    const { token, user } = await authService.register({ correo, password });

    res.status(201).json({
      ok: true,
      token,
      user,
    });
  } catch (err) {
    console.error("Error en /auth/register:", err);

    if (err.code === "EMAIL_IN_USE") {
      return res.status(409).json({ ok: false, error: "Correo ya registrado." });
    }

    res.status(500).json({ ok: false, error: "Error en el registro." });
  }
});

/**
 * POST /auth/login
 * Login tradicional: correo + contraseña
 */
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "Correo y contraseña son obligatorios." });
    }

    const { token, user } = await authService.login({ correo, password });

    res.json({
      ok: true,
      token,
      user,
    });
  } catch (err) {
    console.error("Error en /auth/login:", err);

    if (err.code === "INVALID_CREDENTIALS") {
      return res
        .status(401)
        .json({ ok: false, error: "Correo o contraseña inválidos." });
    }

    res.status(500).json({ ok: false, error: "Error en el login." });
  }
});

/**
 * POST /auth/google
 * Login / registro con Google + vinculación automática
 */
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ ok: false, error: "Falta token de Google." });
    }

    const { token: appToken, user } = await authService.loginWithGoogle(token);

    res.json({
      ok: true,
      token: appToken,
      email: user.correo,
      rol: user.rol,
      user,
    });
  } catch (err) {
    console.error("Error en /auth/google:", err);

    if (err.code === "GOOGLE_WITHOUT_EMAIL") {
      return res
        .status(400)
        .json({ ok: false, error: "La cuenta de Google no tiene correo." });
    }

    res.status(401).json({ ok: false, error: "Token inválido o error de login." });
  }
});

export default router;
