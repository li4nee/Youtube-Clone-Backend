import { User } from "../models/user.js";
import { generateErrorResponse } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =(await req.cookies?.accessToken) || req.headers("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw generateErrorResponse(400, "No token : Unauthorized Access");
    }
    const decoded = await jwt.verify(token, process.env.ACCESSTOKEN_PRIVATEKEY);
  
    const user = await User.findById({ _id: decoded._id }).select(
      "-password -refreshToken"
    );
  
    if (!user) {
      throw generateErrorResponse(400, "Token Invalid");
    }
  
    req.user = user;
  
    next();
  } catch (err) {
    throw generateErrorResponse(400,"Invalid Token : Unauthorized Access");
  }
});
