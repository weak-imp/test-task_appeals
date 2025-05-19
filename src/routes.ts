import { Router } from "express";
import {
  createAppeal,
  takeAppeal,
  completeAppeal,
  cancelAppeal,
  getAppeals,
  cancelAllInProgress,
} from "./controllers/controller";
import { validateId } from "./middleware/validateId";

const router = Router();

router.post("/", createAppeal);
router.patch("/:id/take", validateId, takeAppeal);
router.patch("/:id/complete", validateId, completeAppeal);
router.patch("/:id/cancel", validateId, cancelAppeal);
router.get("/", getAppeals);
router.post("/cancel-all-in-progress", cancelAllInProgress);

export default router;
