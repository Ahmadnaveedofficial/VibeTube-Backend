import asyncHandler from '../utils/handler.js';
import apiError from "../utils/apiError.js";
import {User} from "../models/Users/user.models.js";

 const registerUser= asyncHandler (async (req,res,next)=>{
   const {email,fullname,password,username}=req.body;
//    console.log("email: ", email);
//    console.log("fullname: ", fullname);
//    console.log("password: ", password);
//    console.log("username: ", username);
//    res.status(201).json({
//        success:true,
//        message:"User registered successfully"
//    });

if ([fullname,password,email,username].some((field)=>field?.trim()===" ")) {
     throw new apiError(400,"All fiels are required");
}
const existedUser= User.findOne({
     $or: [{ username },{ email }]
})
if(existedUser){
    throw new apiError(409,"Email and Username already exist");
}
 });



export { registerUser };