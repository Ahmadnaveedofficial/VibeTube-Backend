import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";

export const app=express();

app.use(cors({
    origin:"*",
}))

app.use(express.json({limit:"100kb"}))
app.use(express.urlencoded({extended:true,limit:"100kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// Routes Here
import userRoutes from './routes/user.routes.js';

app.use('/api/v1/users',userRoutes);


export default app;