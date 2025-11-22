import { Router } from "express";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";
import { imageController } from "../controllers/image.controller.js";

const router = Router();

router.post("/", uploadSingleImage, imageController.upload);
router.get("/album/:idAlbum", imageController.getByAlbum);

export default router;
