import { Router } from "express";
import { authService } from "../services/auth.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authController } from "../controllers/auth.controller.js";
import admin from "../config/firebaseAdmin.js";
import { uploadSelfie } from "../middlewares/upload.middleware.js"; // 👈 NUEVO: Importamos el middleware de Multer

const router = Router();

/**
 * 🔐 POST /auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ ok: false, error: "Falta idToken" });
    }

    const { user, token } = await authService.registerWithToken(idToken);

    return res.status(201).json({ ok: true, token, user });
  } catch (err) {
    console.error("Error en /auth/register:", err);
    return res.status(500).json({ ok: false, error: "Error en el registro." });
  }
});

/**
 * 🔐 POST /auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ ok: false, error: "Falta idToken" });
    }

    const { user, token } = await authService.loginWithToken(idToken);

    return res.json({ ok: true, token, user });
  } catch (err) {
    console.error("Error en /auth/login:", err);
    return res.status(401).json({ ok: false, error: "Token inválido" });
  }
});

/**
 * 🔐 POST /auth/google
 */
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ ok: false, error: "Falta idToken" });
    }

    const { user, token } = await authService.loginWithGoogle(idToken);

    return res.json({ ok: true, token, user });
  } catch (err) {
    console.error("Error en /auth/google:", err);
    return res.status(401).json({ ok: false, error: "Token inválido o error de login." });
  }
});

/**
 * 🔐 GET /auth/me
 */
router.get("/me", authMiddleware, authController.me);

/**
 * ⭐ NUEVO — Actualizar datos del perfil (Nombre)
 * PUT /auth/update
 */
router.put("/update", authMiddleware, authController.updateProfile);

/**
 * ⭐ NUEVO — Subir selfie de reconocimiento facial
 * POST /auth/upload-selfie
 */
router.post(
  "/upload-selfie", 
  authMiddleware, 
  uploadSelfie.single("selfie"), 
  authController.uploadSelfie
);

/**
 * ⭐ NUEVO — Asignar rol admin a un usuario
 * POST /auth/set-admin
 */
router.post("/set-admin", async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Falta UID del usuario." });
    }

    await admin.auth().setCustomUserClaims(uid, { role: "admin" });

    return res.json({
      ok: true,
      message: `Rol ADMIN asignado correctamente al usuario ${uid}`,
    });
  } catch (err) {
    console.error("Error asignando rol admin:", err);
    return res.status(500).json({ error: "No se pudo asignar el rol." });
  }
});

export default router;