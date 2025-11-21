import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import "dotenv/config"
import path from "path"

import albumRoutes from "./routes/album.routes.js"

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(morgan("dev"))

// Servir imágenes
app.use("/uploads", express.static(path.resolve("src/uploads")))

// Rutas del API
app.use("/api/albums", albumRoutes)

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "fototrack-api" })
})

app.listen(PORT, () => {
  console.log(`✔ API running on http://localhost:${PORT}`)
})
