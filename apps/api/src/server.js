// apps/api/src/server.js 
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

// =====================================================
// 📂 IMPORTACIÓN DE RUTAS
// =====================================================
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import imageRoutes from "./routes/images.routes.js";
import albumRoutes from "./routes/album.routes.js";
import configRoutes from "./routes/config.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js"; 
import paymentRoutes from "./routes/payment.routes.js";   

// =====================================================
// 🧠 MIDDLEWARES / CONTROLLERS / SERVICES
// =====================================================
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { authController } from "./controllers/auth.controller.js";
import { faceService } from "./services/face.service.js";

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
    origin: "http://localhost:5173", // Tu Frontend
    credentials: true,
  })
);

// =====================================================
// ⭐ SEGURIDAD Y LOGS (CORREGIDO PARA IMÁGENES LOCALES)
// =====================================================
// Helmet por defecto bloquea la carga de recursos de distintos orígenes (puertos).
// Le indicamos explícitamente que permita cross-origin para que el Frontend (puerto 5173) 
// pueda leer las fotos (puerto 4000).
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan("dev"));

// ⚠️ IMPORTANTE: Parseo de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// ⭐ RUTAS API
// =====================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/imagenes", imageRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/config", configRoutes);
app.use("/api/carrito", cartRoutes);
app.use("/api/compras", purchaseRoutes);
app.use("/api/payment", paymentRoutes); 

app.get("/api/auth/me", authMiddleware, authController.me);

// =====================================================
// ⭐ SERVIR UPLOADS LOCALES (CORREGIDO PARA MULTER)
// =====================================================
// Usamos process.cwd() porque la carpeta uploads está en la raíz de apps/api, no dentro de src
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`✔ API running on http://localhost:${PORT}`);
  console.log(`✔ Cloudinary conectado como: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  
  try {
    console.log("⏳ Cargando modelos de FaceAPI...");
    await faceService.loadModels();
    console.log("🤖 Modelos de IA cargados correctamente.");
  } catch (error) {
    console.error("❌ Error cargando modelos de IA:", error.message);
  }
  
  console.log(`==================================================\n`);
});