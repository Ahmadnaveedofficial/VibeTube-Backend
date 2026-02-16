import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.models.js"
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/handler.js";

// get channel stats

const getChannelStats = asyncHandler(async (req, res) => {
    //  Get the channel stats like total video views, total subscribers, total videos, total likes etc. 

    const userId = req.user?._id;

    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $group: {
                _id: null,
                subscribersCount: {
                    $sum: 1
                }
            }
        }
    ]);

    const video = await Video.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$totalLikes"
                },
                totalViews: {
                    $sum: "$totalViews"
                },
                totalVideos: {
                    $sum: 1
                }
            }
        }
    ]);

    const channelStats = {
        totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
        totalViews: video[0]?.totalViews || 0,
        totalVideos: video[0]?.totalVideos || 0
    };

    return res.status(200).json(
        new apiResponse(200, channelStats, "channel stats fetched Successfully")
    );
});

// get channel videos

const getChannelVideos = asyncHandler(async (req, res) => {
    //  Get all the videos uploaded by the channel

    const userId = req.user?._id;

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            }
        },
        {
            $addFiels: {
                createdAt: {
                    $dateToParts: { date: "$createdAt" }
                },
                likeCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                "videoFile.url": 1,
                "thumbnail.url": 1,
                title: 1,
                description: 1,
                createdAt: {
                    year: 1,
                    month: 1,
                    day: 1
                },
                isPublished: 1,
                likesCount: 1
            }
        }
    ]);

    return res.status(200).json(
        new apiResponse(200, videos, "channel videos fetched successfully")
    );
});

export {
    getChannelStats, getChannelVideos
};