// src/routes/user.routes.js
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js"; 
import { userController } from "../controllers/user.controller.js";
import { reportController } from "../controllers/report.controller.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = Router();

// ==========================================
// 🛡️ RUTAS ADMINISTRADOR
// ==========================================

/**
 * 📊 REPORTE EJECUTIVO (Métricas para Dashboard)
 * Al usar app.use("/api/reports", userRoutes) en server.js,
 * esta ruta queda expuesta como: GET /api/reports/executive
 */
router.get("/executive", authMiddleware, requireAdmin, reportController.getExecutiveReport);

/**
 * Obtener lista completa de usuarios
 */
router.get("/admin/all", authMiddleware, requireAdmin, userController.getAllUsers);

/**
 * Cambiar el rol de un usuario
 */
router.put("/admin/:id/role", authMiddleware, requireAdmin, userController.changeRole);

/**
 * Cambiar estado (activo/inactivo)
 */
router.put("/admin/:id/status", authMiddleware, requireAdmin, userController.changeStatus);

/**
 * 🗑️ ELIMINAR USUARIO (Admin borra a otros)
 */
router.delete("/admin/:id", authMiddleware, requireAdmin, userController.deleteUser); 

/**
 * 🕵️‍♂️ Auditoría del sistema
 */
router.get("/audit", authMiddleware, requireAdmin, userController.getAuditLogs);

// ==========================================
// 👤 RUTAS USUARIO FINAL
// ==========================================

/**
 * 🗑️ ELIMINAR CUENTA (Usuario se borra a sí mismo)
 */
router.delete("/me", authMiddleware, userController.deleteUser); 

/**
 * Configurar Face ID inicial
 */
router.post("/face-setup", authMiddleware, uploadSingleImage, userController.setupFaceId);

/**
 * Obtener fotos detectadas por la IA para el usuario logueado
 */
router.get("/me/photos", authMiddleware, userController.getMyMatches);

export default router;