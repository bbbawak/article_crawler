import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import { LuncBurnServices } from "./luncBurn.service";
import catchAsync from "../../../shared/catchAsync";
import { luncBurnValidation } from "./luncBurn.validation";
import { LuncBurn } from "@prisma/client";

const createLuncBurnArchive = catchAsync(async (req, res) => {
  const result = await LuncBurnServices.createLuncBurnArchiveIntoDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "LuncBurn Archive created successfully!",
    data: result,
  });
});

const createLuncBurn = catchAsync(async (req, res) => {
  const payload = luncBurnValidation.createLuncBurnSchema.parse(req.body);
  const luncBurnArchiveId = req.params.luncBurnArchiveId;
  const result = await LuncBurnServices.createLuncBurnIntoDB({
    ...payload,
    luncBurnArchiveId,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "LuncBurn created successfully!",
    data: result,
  });
});

//update shiba burn
const updateLuncBurn = catchAsync(async (req, res) => {
  const payload = luncBurnValidation.updateLuncBurnSchema.parse(req.body);
  const luncBurnId = req.params.luncBurnId;
  const result = await LuncBurnServices.updateLuncBurnIntoDB(
    payload,
    luncBurnId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "LuncBurn updated successfully!",
    data: result,
  });
});

//delete shiba burn
const deleteLuncBurn = catchAsync(async (req, res) => {
  const luncBurnId = req.params.luncBurnId;
  const result = await LuncBurnServices.deleteLuncBurnFromDB(luncBurnId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "LuncBurn deleted successfully!",
    data: result,
  });
});

//get lunc burn by month and year
const getLuncBurnByMonthAndYear = catchAsync(async (req, res) => {
  const result = await LuncBurnServices.getLuncBurnByMonthAndYear(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "LuncBurn fetched successfully!",
    data: result,
  });
});

//get both shiba burn and lunc burn archive main model 
const getShibAndLuncBurnArchive = catchAsync(async (req, res) => {
  const result = await LuncBurnServices.getShibAndLuncBurnArchive();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "ShibaBurn and LuncBurn fetched successfully!",
    data: result,
  });
});

//get all lunc burn
const getAllLuncBurn = catchAsync(async (req, res) => {
  const result = await LuncBurnServices.getAllLuncBurn(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All LuncBurn fetched successfully!",
    data: result,
  });
});
  
export const LuncBurnController = {
  createLuncBurnArchive,
  createLuncBurn,
  updateLuncBurn,
  deleteLuncBurn,
  getLuncBurnByMonthAndYear,
  getShibAndLuncBurnArchive,
  getAllLuncBurn
};
