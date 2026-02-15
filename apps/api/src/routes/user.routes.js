import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { userController } from "../controllers/user.controller.js";
// 👇 Importamos el middleware centralizado (Mejor práctica)
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = Router();

// POST http://localhost:4000/api/users/face-setup
router.post(
  "/face-setup", 
  authMiddleware,          // 1. Solo usuarios logueados
  uploadSingleImage,       // 2. Middleware centralizado (Espera campo "image")
  userController.setupFaceId // 3. Ejecuta la lógica
);

// GET http://localhost:4000/api/users/me/photos
// 👇 Cambiado a "/me/photos" para coincidir con tu Frontend
router.get("/me/photos", authMiddleware, userController.getMyMatches);

export default router;