// apps/api/src/routes/cart.routes.js
import { Router } from "express";
import { cartController } from "../controllers/cart.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/mio", cartController.getMyCart);
router.post("/add", cartController.addImage);
router.delete("/item/:idItem", cartController.removeItem);
router.delete("/mio", cartController.clearMyCart);

export default router;
