import { Router } from "express";
import { LuncBurnController } from "./luncBurn.controller";
import { verifyUser } from "../../middlewares/auth";

const router = Router();

//create lunc burn archive
router.post(
  "/create-lunc-burn-archive",
  verifyUser,
  LuncBurnController.createLuncBurnArchive
);

//create lunc burn
router.post(
  "/create-lunc-burn/:luncBurnArchiveId",
  verifyUser,
  LuncBurnController.createLuncBurn
);

//update lunc burn
router.patch(
  "/update-lunc-burn/:luncBurnId",
  verifyUser,
  LuncBurnController.updateLuncBurn
);

//delete lunc burn
router.delete(
  "/delete-lunc-burn/:luncBurnId",
  verifyUser,
  LuncBurnController.deleteLuncBurn
);

//get lunc burn data by month and year
router.get(
  "/get-lunc-burn",
  //   verifyUser,
  LuncBurnController.getLuncBurnByMonthAndYear
);

//get both shiba and lunc burn archive main model
router.get(
  "/all-archive",
  // verifyUser,
  LuncBurnController.getShibAndLuncBurnArchive
);

//get all lunc burn
router.get(
  "/all-lunc-burn",
  // verifyUser,
  LuncBurnController.getAllLuncBurn
);

export const luncBurnRoutes = router;
