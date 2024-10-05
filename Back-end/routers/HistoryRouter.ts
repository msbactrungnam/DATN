import { Router } from "express";
import * as historyController from "../controllers/HistoryController";

const router = Router();

router.post("/create-history", historyController.createHistory);
router.put("/update-history/:id", historyController.updateHistory);
router.delete("/delete-history/:id", historyController.deleteHistory);
router.get("/get-history", historyController.getHistory);
router.get("/get-all-histories", historyController.getAllHistories);

export default router;
