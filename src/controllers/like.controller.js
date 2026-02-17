import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js"
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/handler.js";


// toggle video like

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "invalid video id");
    }

    const likedAlready = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id);

        return res.status(200).json(
            new apiResponse(200, { isLiked: false })
        );
    }

    await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    });

    return res.status(200).json(
        new apiResponse(200, { isLiked: true })
    );
});

// toggle a Comment Like 

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "invalid video id");
    }

    const likedAlready = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id);

        return res.status(200).json(
            new apiResponse(200, { isLiked: false })
        );
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    return res.status(200).json(
        new apiResponse(200, { isLiked: true })
    );
});


// toggle a Tweet Like 

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweetId");
    }


    const likedAlready = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id);

        return res
            .status(200)
            .json(new apiResponse(200, { tweetId, isLiked: false }));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    return res.status(200).json(new
        apiResponse(200, { isLiked: true })
    );
});

// get aLiked Videos 
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideosAggegate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"likedVideo",
                pipeline:[
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        },
                    },
                    {
                      $unwind: "$ownerDetails",
                    }
                ]
            }
        },
        {
            $unwind:"$likedVideo"
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project :{
                _id:0,
                likedVideo:{
                      "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1, isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                    }
                }
            }
        }
    ]);

    return res.status(200).json(
        new apiResponse(200,likedVideosAggegate,"liked Video fetched successfully")
    );
});

export {toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos};