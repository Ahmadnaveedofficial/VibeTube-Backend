import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/handler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/Users/user.models.js";

export const verifyJWT=asyncHandler(async (req,res,next) => {
    try {
       const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
       
       if(!token){
          throw new apiError(401,"Unauthorization request")
       }
  
     const decodedtoken=  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
  
     const user= await User.findById(decodedtoken?._id).select("-password -refreshToken");
     if(!user){
         throw new apiError(401,"Invalid access token");
     }
     req.user=user;
     next();
    } catch (error) {
       throw new apiError(401,error?.message|| "invalid access token");
    }

})