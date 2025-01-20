import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { LuncServices } from "./lunc.service";

const createLunc = catchAsync(async (req, res) => {
  const payload = req.body;
  const newShib = await LuncServices.createLunc(payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: " successfully",
    data: newShib,
  });
});

const updateLunc = catchAsync(async (req, res) => {
  const payload = req.body;
  const newShib = await LuncServices.updateLunc(payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "updated successfully",
    data: newShib,
  });
});

const getLuncInformation = catchAsync(async (req, res) => {
  const lunc = await LuncServices.getLuncInformation();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Retrieve Lunc Successfully",
    data: lunc,
  });
});

export const LunsControllers = {
  createLunc,
  updateLunc,
  getLuncInformation,
};
