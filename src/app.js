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
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.route.js';
import tweetRouter from './routes/tweet.route.js';
import subscriptionRouter  from './routes/subscription.route.js';
import playlistRouter from "./routes/playlist.route.js";
import healthcheckRouter  from "./routes/healthcheck.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";

//routes declaration
app.use('/api/v1/users',userRouter);
app.use('/api/v1/videos',videoRouter);
app.use('/api/v1/tweets',tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlist",playlistRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/dashboard",dashboardRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/likes",likeRouter);



export default app;