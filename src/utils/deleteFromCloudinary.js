import {vs as cloudinary } from "cloudinary";
import asyncHandler from "./handler.js";
import apiError from "./apiError.js";


const deleteFromCloudinary =asyncHandler(async (imageUrl) => {
    if(!imageUrl){
        throw new apiError(400,"image url is required")
    }
    const publicId = imageUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];
    await cloudinary.v2.uploader.destroy(publicId);
});

export default deleteFromCloudinary;