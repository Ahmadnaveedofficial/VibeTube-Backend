import asyncHandler from '../utils/handler.js';


 const registerUser= asyncHandler (async (req,res,next)=>{
    res.status(200).json({
        success:true,
        message:"User registered successfully hello i am from controller and i am mern stack developer",
    });
 });

export { registerUser };