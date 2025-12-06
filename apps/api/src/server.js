// src/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

// Rutas
import authRoutes from "./routes/auth.routes.js";
import imageRoutes from "./routes/images.routes.js";   // ✔ único router correcto
import albumRoutes from "./routes/album.routes.js";
import configRoutes from "./routes/config.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";

// Middlewares / Controllers
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { authController } from "./controllers/auth.controller.js";

// Cloudinary
import { v2 as cloudinary } from "cloudinary";

// Necesario para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar express
const app = express();
const PORT = process.env.PORT || 4000;

// =====================================================
// ⭐ CONFIG CLOUDINARY
// =====================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =====================================================
// ⭐ CORS – IMPORTANTE para permitir frontend Vite
// =====================================================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// =====================================================
// ⭐ RUTAS API
// =====================================================

// 🔐 Autenticación
app.use("/api/auth", authRoutes);

// 📸 Imágenes
app.use("/api/imagenes", imageRoutes);  // ✔ único router de imágenes

// 📁 Álbumes
app.use("/api/albums", albumRoutes);

// ⚙ Configuración admin
app.use("/api/config", configRoutes);

// 🛒 Carrito
app.use("/api/carrito", cartRoutes);

// 💳 Compras
app.use("/api/compras", purchaseRoutes);

// =====================================================
// 🔐 Obtener usuario autenticado
// =====================================================
app.get("/api/auth/me", authMiddleware, authController.me);

// =====================================================
// ⭐ SERVIR UPLOADS LOCALES (TEMPORAL)
// =====================================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================================================
// ⭐ HEALTH CHECK
// =====================================================
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "fototrack-api",
    cloudinaryConnected: !!process.env.CLOUDINARY_CLOUD_NAME,
  });
});

// =====================================================
// ⭐ INICIAR SERVIDOR
// =====================================================
app.listen(PORT, () => {
  console.log(`✔ API running on http://localhost:${PORT}`);
  console.log("✔ Cloudinary conectado como:", process.env.CLOUDINARY_CLOUD_NAME);
});
