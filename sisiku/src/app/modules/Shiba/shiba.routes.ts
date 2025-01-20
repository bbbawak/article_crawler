import { Router } from "express";
import { ShibaControllers } from "./shiba.controller";

const router = Router();

router.get("/get-shiba", ShibaControllers.getShibInformation);
router.post("/create-shiba",ShibaControllers.createShib)
router.patch("/update-shiba", ShibaControllers.updateShib);


export const shibRoutes = router