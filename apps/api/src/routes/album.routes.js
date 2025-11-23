// src/routes/album.routes.js
import { Router } from "express";
import { albumController } from "../controllers/album.controller.js";


const router = Router();

router.get("/", albumController.getAll);
router.post("/", albumController.create);
router.delete("/:id", albumController.eliminar);
router.put("/:id", albumController.actualizar);

export default router;
