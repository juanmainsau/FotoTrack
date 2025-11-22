import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import imageRoutes from "./routes/images.routes.js";  // CORREGIDO
import albumRoutes from "./routes/album.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/imagenes", imageRoutes);
app.use("/api/albums", albumRoutes);

// Servir imágenes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "fototrack-api" });
});

app.listen(PORT, () => {
  console.log(`✔ API running on http://localhost:${PORT}`);
});
