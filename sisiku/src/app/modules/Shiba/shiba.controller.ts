import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ShibServices } from "./shiba.service";

const createShib = catchAsync(async (req, res) => {
  const payload = req.body;
  const newShib = await ShibServices.createShib(payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: " successfully",
    data: newShib,
  });
});

const updateShib = catchAsync(async (req, res) => {
  const payload = req.body;
  const newShib = await ShibServices.updateShib(payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "updated successfully",
    data: newShib,
  });
});

const getShibInformation = catchAsync(async (req, res) => {
  const shiba = await ShibServices.getShibInformation();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Retrieve Shiba Successfully",
    data: shiba,
  });
});

export const ShibaControllers = {
  createShib,
  updateShib,
  getShibInformation,
};
