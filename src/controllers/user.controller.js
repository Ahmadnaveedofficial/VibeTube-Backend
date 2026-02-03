import asyncHandler from '../utils/handler.js';
import apiError from "../utils/apiError.js";
import { User } from "../models/Users/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";

const generateAccessAndRefreshTokens=async (userId) => {
     try {
           const user=await User.findOne(userId);
           user.generateAccessToken
           user.generateRefreshToken
     } catch (error) {
          new apiError(500,"Something went Wrong while using the access and refresh token");
     }
}
const registerUser = asyncHandler(async (req, res, next) => {
     const { email, fullname, password, username } = req.body;
     //    console.log("email: ", email);
     //    console.log("fullname: ", fullname);
     //    console.log("password: ", password);
     //    console.log("username: ", username);
     //    console.log("FILES:", req.files);
     // console.log("BODY:", req.body);

     //    res.status(201).json({
     //        success:true,
     //        message:"User registered successfully"
     //    });

     // if ([fullname,password,email,username].some((field)=>field?.trim()==="")) {
     //      throw new apiError(400,"All fiels are required");
     // }
     if ([fullname, password, email, username].some(f => !f?.trim())) {
          throw new apiError(400, "All fields are required");
     }

     const existedUser = await User.findOne({
          $or: [{ username }, { email }]
     })
     // console.log("existedUser: ", existedUser);
     if (existedUser) {
          throw new apiError(409, "Email and Username already exist");
     }

     const avatarLocalPath = req.files?.avatar[0]?.path;
     // const coverImageLocalPath = req.files?.coverImage[0]?.path;

     let coverImageLocalPath;
     if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
          coverImageLocalPath = req.files.coverImage[0].path;
     }

     if (!avatarLocalPath) {
          throw new apiError(400, "Avatar files must be required");
     }
     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     if (!avatar) {
          throw new apiError(400, "Avatar files must be required");
     }
     const user = await User.create({
          fullname,
          avatar: avatar.url,
          coverImage: coverImage?.url || " ",
          email,
          password,
          username: username.toLowerCase(),
     })

     const userCreated = await User.findById(user._id).select(
          "-password -refreshToken"
     )

     if (!userCreated) {
          throw new apiError(500, "Something went wrong while register user")
     }

     return res.status(201).json(
          new apiResponse(200, userCreated, "user Register Successfully")
     )

});

const loginUser = asyncHandler(async (req, res) => {
     // req body data 
     // validated by username or email 
     // find by user by username or email
     // password check
     // access and refresh token 
     //  send token using cookies 

     const { username, email, password } = req.body;
     if (!username || !email) {
          throw new apiError(400, "Username or email is required");
     }

     const user = await User.findOne({
          $or: [{ username }, { email }]
     })

     if (!user) {
          throw new apiError(404, "User does not exist")
     }

     const passwordValid = await user.isPassword(password);
     if (!passwordValid) {
          throw new apiError(404, "Ivalid user credentials");
     }
      



});

export { registerUser, loginUser };

