import asyncHandler from '../utils/handler.js';
import apiError from "../utils/apiError.js";
import { User } from "../models/Users/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
     try {
          const user = await User.findById(userId);
          if (!user) {
               throw new apiError(404, "User not found while generating tokens");
          }
          const accessToken = user.generateAccessToken();
          const refreshToken = user.generateRefreshToken();

          user.refreshToken = refreshToken;
          await user.save({ validateBeforeSave: false });

          return { accessToken, refreshToken };
     } catch (error) {
          throw new apiError(500, error.message || "Something went Wrong while using the access and refresh token");
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
     //      // req body data 
     //      // validated by username or email 
     //      // find by user by username or email
     //      // password check
     //      // access and refresh token 
     //      //  send token using cookies 
     console.log("1 Login attempt:", req.body);
     const { username, email, password } = req.body;
     if (!(username || email)) {
          throw new apiError(400, "Username or email is required");
     }

     console.log("2 Finding user by username or email");
     const user = await User.findOne({
          $or: [{ username }, { email }]
     })

     if (!user) {
          throw new apiError(404, "User does not exist")
     }
     console.log("3 User found", user.username, user.email);
     if (!password) {
          throw new apiError(400, "Password is required");
     }
     console.log("4 Checking password");
     const passwordValid = await user.isPasswordCorrect(password);
     console.log("5 Password valid:", passwordValid);
     if (!passwordValid) {
          throw new apiError(401, "Invalid user credentials");
     }

     console.log("6 Generating tokens");
     const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
     console.log("7 Tokens generated successfully");
     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

     const options = {
          httpOnly: true,
          secure: true
     }

     console.log("8. Sending response...");
     return res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(
               new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in Successfully")
          )

});


const logoutUser = asyncHandler(async (req, res) => {

     await User.findByIdAndUpdate(
          req.user._id, {
          $set: {
               refreshToken: undefined,
          }
     }, {
          new: true,
     }
     )
     const options = {
          httpOnly: true,
          secure: true,
     }

     return res.status(200)
          .clearCookie("accessToken", options)
          .clearCookie("refreshToken", options)
          .json(new apiResponse(200, {}, "User logged out Successfully"))

});

const refreshAccessToken = asyncHandler(async (req, res) => {
     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
     if (!incomingRefreshToken) {
          throw new apiError(401, "unAuthorization request");
     }
     try {
          const decodedToken = jwt.verify(
               incomingRefreshToken,
               process.env.REFRESH_TOKEN_SECRET
          )
          const user = await User.findById(decodedToken?._id);
          if (!user) {
               throw new apiError(401, "invalid refresh token")
          }
          if (incomingRefreshToken !== user?.refreshToken) {
               throw new apiError(401, "refresh token is expired or used")
          }
          const { newRefreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);
          const options = {
               httpOnly: true,
               secure: true,
          }
          return res.status(200)
               .cookie("accessToken", accessToken, options)
               .cookie("refreshToken", newRefreshToken, options)
               .json(new apiResponse(200, { accessToken, refreshToken: newRefreshToken }, "access Token successfully"))
     } catch (error) {
          throw new apiError(401, error?.message || "invalid refresh token")
     }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
     const { oldPassword, newPassword } = req.body;
     const user = await User.findById(req.user?._id);
     const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
     if (!isPasswordCorrect) {
          throw new apiError(400, "Invalid Password");
     }
     user.password = newPassword;
     await user.save({ validateBeforeSave: false })

     return res.status(200)
          .json(new apiResponse(200, "password changed successfully"))

});

const getCurrentUser = asyncHandler(async (req, res) => {
     return res.status(200)
          .json(200, req.user, "current user fetch successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
     const { fullname, email } = req.body;
     if (!fullname || !email) {
          throw new apiError(400, "all field are required");
     }
     const user = User.findByIdAndUpdate(
          req.user?._id,
          {
               $set: {
                    fullname: fullname,
                    email: email,
               }
          },
          { new: true }
     ).select("-password")

     return res.status(200)
          .json(new apiResponse(200, user, "account details successfully"));

});

const updateUserAvatar = asyncHandler(async (req, res) => {
     const avatarLocalPath = req.file?.path;
     if (!avatarLocalPath) {
          throw new apiError(400, "avatar file is missing ")
     }
     const avatar = await uploadOnCloudinary(avatarLocalPath);
     if (!avatar.url) {
          throw new apiError(400, "error while uploading on avatar")
     }
     const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
               $set: {
                    avatar: avatar.url,
               }
          },
          {
               new: true
          }
     ).select("-password")
     return res.status(200)
          .json(new apiResponse(200, user, "avatar update successfully"))
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
     const coverImageLocalPath = req.file?.path;
     if (!coverImageLocalPath) {
          throw new apiError(400, "avatar file is missing ")
     }
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);
     if (!coverImage.url) {
          throw new apiError(400, "error while uploading on coverImage")
     }
     const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
               $set: {
                    coverImage: coverImage.url,
               }
          },
          {
               new: true
          }
     ).select("-password");

     return res.status(200)
          .json(new apiResponse(200, user, "cover Image update successfully"))
})
export { registerUser, 
     loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage};

