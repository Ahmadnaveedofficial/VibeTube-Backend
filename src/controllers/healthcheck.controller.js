import asyncHandler from "../utils/handler.js";
import {apiError} from "../utils/apiError.js";
import {apiResponse} from "../utils/apiResponse.js";


const healthCheck=asyncHandler(async(req,res)=>{
    res.status(200).json(apiResponse(true,{message:"Server is healthy"},"Health Check Success"));
});