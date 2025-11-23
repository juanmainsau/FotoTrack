import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import imageRoutes from "./routes/images.routes.js";
import albumRoutes from "./routes/album.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// ⭐ CORS IMPORTANTE
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// ⭐ RUTAS DEL API
app.use("/auth", authRoutes);
app.use("/api/imagenes", imageRoutes);
app.use("/api/albums", albumRoutes);

// Servir imágenes locales
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "fototrack-api" });
});

// ⭐ INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`✔ API running on http://localhost:${PORT}`);
});
