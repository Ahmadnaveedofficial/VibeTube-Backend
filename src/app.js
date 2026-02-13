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
import videoRoutes from './routes/video.route.js';


app.use('/api/v1/users',userRoutes);
app.use('/api/v1/videos',videoRoutes);


export default app;