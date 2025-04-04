import { Router } from "express";
import { addConfig, getUserConfig, removeConfig } from "../controllers/userConfig.controller.js";

const router = Router();

router.post("/user-config", addConfig);
router.get("/user-config/:domain", getUserConfig);
router.delete("/user-config/:domain", removeConfig);

export default router;