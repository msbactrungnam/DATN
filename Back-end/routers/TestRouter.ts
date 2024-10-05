import { Router } from "express";
import * as testController from "../controllers/TestController";

const router = Router();

router.post("/create-test", testController.createTest);
router.put("/update-test/:id", testController.updateTest);
router.delete("/delete-test/:id", testController.deleteTest);
router.get("/get-test", testController.getTest);
router.get("/get-all-tests", testController.getAllTests);

export default router;
