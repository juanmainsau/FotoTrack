import { Router } from "express";
import { configService } from "../services/config.service.js";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";

const router = Router();
const upload = multer({ dest: "temp/" });

// 🔐 Obtener configuración (solo admin)
router.get("/", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const config = await configService.getConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ msg: "Error al obtener configuración" });
  }
});

// 🔐 Guardar parámetros (solo admin)
router.put("/", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const updated = await configService.updateConfig(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Error al actualizar configuración" });
  }
});

// 🔐 Subir watermark (solo admin)
router.post(
  "/watermark",
  authMiddleware,
  requireAdmin,
  upload.single("watermark"),
  async (req, res) => {
    try {
      const updated = await configService.uploadWatermark(req.file);
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Error al subir watermark" });
    }
  }
);

export default router;
