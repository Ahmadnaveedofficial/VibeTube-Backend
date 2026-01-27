// promise method
//  const asyncHandler=(resquestHandler)=>{
//  return (error,req,res,next)=>{
//             Promise
//             .resolve(resquestHandler(req,res,next))
//             .catch((error)=>next(error))
//     }
// }


const asyncHandler = (requestHandler) => {
  return (req, res, next) => {  
    Promise
      .resolve(requestHandler(req, res, next))
      .catch(next);
  };
};




export default  asyncHandler;



// try catch method

// const asyncHandler1=(resquestHandler)=>async (req,res,next) => {
//      try {
//         await resquestHandler (req,res,next);
//      } catch (error) {
//         res.status(error.code|| 500).json({
//             success:false ,
//             message:error.message,      
//         })
//      }
// }
