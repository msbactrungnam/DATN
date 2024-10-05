import { Router } from "express";
import * as userController from "../controllers/UserController";
import {
  authMiddleware,
  authUserMiddleware,
} from "../middleware/authMiddleware";

const router = Router();

router.post("/sign-up", userController.createUser);
router.post("/sign-in", userController.loginUser);
router.post("/logout", userController.logoutUser);
router.put("/update-user/:id", userController.updateUser);
router.delete("/delete-user/:id", userController.deleteUser);
router.get("/get-user", userController.getUser);
router.post("/refresh-token", userController.refreshToken);
router.post("/add-patient", userController.addPatientToDoctor);
router.post("/add-doctor", userController.addDoctorToPatient);
router.put('/remove-patient/', userController.removePatientFromDoctor);
router.put('/remove-doctor/', userController.removeDoctorFromPatient);

export default router;
