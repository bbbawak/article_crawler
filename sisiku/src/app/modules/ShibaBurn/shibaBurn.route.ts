import { Router } from "express";
import { ShibaBurnController } from "./shibaBurn.controller";
import { verifyUser } from "../../middlewares/auth";

const router = Router();

//create shiba burn archive
router.post(
  "/create-shiba-burn-archive",
  verifyUser,
  ShibaBurnController.createShibaBurnArchive
);

//create shiba burn
router.post(
  "/create-shiba-burn/:shibaBurnArchiveId",
  verifyUser,
  ShibaBurnController.createShibaBurn
);

//update shiba burn
router.patch(
  "/update-shiba-burn/:shibaBurnId",
  verifyUser,
  ShibaBurnController.updateShibaBurn
);

//delete shiba burn
router.delete(
  "/delete-shiba-burn/:shibaBurnId",
  verifyUser,
  ShibaBurnController.deleteShibaBurn
);

//get shiba burn data by month and year
router.get(
  "/get-shiba-burn",
//   verifyUser,
  ShibaBurnController.getShibaBurnByMonthAndYear
);

//get all shiba burn
router.get(
  "/all-shiba-burn",
//   verifyUser,
  ShibaBurnController.getAllShibaBurn
);


export const shibaBurnRoutes = router;
