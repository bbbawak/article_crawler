import { Router } from "express";
import { LunsControllers } from "./lunc.controller";

const router = Router();

router.get("/get-lunc", LunsControllers.getLuncInformation);
router.post("/create-lunc", LunsControllers.createLunc);
router.patch("/update-lunc", LunsControllers.updateLunc);

export const luncRoutes = router;
