import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import { ShibaBurnServices } from "./shibaBurn.service";
import catchAsync from "../../../shared/catchAsync";
import { shibaBurnValidation } from "./shibaBurn.validation";
import { ShibaBurn } from "@prisma/client";

const createShibaBurnArchive = catchAsync(async (req, res) => {
  const result = await ShibaBurnServices.createShibaBurnArchiveIntoDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "ShibaBurn Archive created successfully!",
    data: result,
  });
});

const createShibaBurn = catchAsync(async (req, res) => {
  const payload = shibaBurnValidation.createShibaBurnSchema.parse(req.body);
  const shibaBurnArchiveId = req.params.shibaBurnArchiveId;
  const result = await ShibaBurnServices.createShibaBurnIntoDB({
    ...payload,
    shibaBurnArchiveId,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "ShibaBurn created successfully!",
    data: result,
  });
});

//update shiba burn
const updateShibaBurn = catchAsync(async (req, res) => {
  const payload = shibaBurnValidation.updateShibaBurnSchema.parse(req.body);
  const shibaBurnId = req.params.shibaBurnId;
  const result = await ShibaBurnServices.updateShibaBurnIntoDB(
    payload,
    shibaBurnId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "ShibaBurn updated successfully!",
    data: result,
  });
});

//delete shiba burn
const deleteShibaBurn = catchAsync(async (req, res) => {
  const shibaBurnId = req.params.shibaBurnId;
  const result = await ShibaBurnServices.deleteShibaBurnFromDB(shibaBurnId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "ShibaBurn deleted successfully!",
    data: result,
  });
});

//get shiba burn by month and year
const getShibaBurnByMonthAndYear = catchAsync(async (req, res) => {
  const result = await ShibaBurnServices.getShibaBurnByMonthAndYear(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "ShibaBurn fetched successfully!",
    data: result,
  });
});
//get all shiba burn
const getAllShibaBurn = catchAsync(async (req, res) => {
  const result = await ShibaBurnServices.getAllShibaBurn(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All ShibaBurn fetched successfully!",
    data: result,
  });
});

export const ShibaBurnController = {
  createShibaBurnArchive,
  createShibaBurn,
  updateShibaBurn,
  deleteShibaBurn,
  getShibaBurnByMonthAndYear,
  getAllShibaBurn,
};
