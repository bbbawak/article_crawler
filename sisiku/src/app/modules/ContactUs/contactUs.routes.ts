import { Router } from "express";
import { contactUsController } from "./contactUs.controller";

const router = Router();

router.post("/send-email", contactUsController.sendEmailFromContactUs);

export const contactUsRoutes = router;
