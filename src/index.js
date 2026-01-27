// import mongoose from "mongoose";
// import DB_NAME from "constants.js";
// import express from "express";

// import dotenv  from "dotenv";
// dotenv.config({
//     path: './env'
// });

// const app=express();

// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("Error",error);
//             throw error;
//         })
//         app.listen(process.env.PORT,()=>{P
//             console.log(`App is running on port ${process.env.PORT}`);
            
//         })
//     } catch (error) {
//         console.error("Error : ",error);
        
        
//     }
// })()

import dbConfig from "./db/db.js";
import {app} from "./app.js";
import dotenv  from "dotenv";
    dotenv.config({
        path: './env'
    });


dbConfig()
.then(()=>{
    app.listen(process.env.PORT ,()=>{
        console.log(`App is running at port: ${process.env.PORT}`)
    })
    app.on("error",(error)=>{
        console.log("app id failed!!!!!!!!",error)
    })
})
.catch((error)=>{
    console.log("DB connection Failed!! : ",error)
})

