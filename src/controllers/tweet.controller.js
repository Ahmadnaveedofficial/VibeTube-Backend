import asyncHandler from 'express-async-handler';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse';
import { Tweet } from '../models/tweet.model.js';
import { User } from '../models/user.model.js';
import mongoose, { isValidObjectId } from 'mongoose';


// new tweet

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new apiError(400, 'content is required');
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user?._id
    });

    if (!tweet) {
        throw new apiError(500, 'failed to create tweet please try again');
    }

    return res.status(200).json(
        new apiResponse(200, tweet, "tweet created successfully")
    );
});

// update tweet

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new apiError(404, "tweet no found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(403, "you are not allowed to update this tweet");
    }

    const newTweet = await Tweet.findByIdAndUpdate(tweetId, {
        content: content
    }, { new: true }
    );

    if (!newTweet) {
        throw new apiError(500, "failed to update tweet please try again");
    }

    return res.status(200).json(
        new apiResponse(200, newTweet, "tweet updated successfully")
    );
});

// delete tweet
const  deleteTweet=asyncHandler(async (req,res) => {
     const { tweetId } = req.params;
     
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet id");
    }

     const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new apiError(404, "tweet no found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(400, "you are not allowed to delete this tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(
        new apiResponse(200, null, "tweet deleted successfully")
    );
});

// get User Tweets

const getUserTweets=asyncHandler(async (req,res) => {
     const {userId}= req.params;

     if(!isValidObjectId(userId)){
        throw new apiError(400,"Invalid user id");
     }
    
     const tweets =await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            },
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as :"ownerDetails",
                pipeline:[
                   {
                     $project:{
                        username:1,
                        "avatar.url": 1,
                    },
                   },
                ],
            },
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likeDetails",
                pipeline:[
                    {
                        $project:{
                            likedBy:1
                        }
                    },
                ]
            }
        },
        {
            $addFields:{
                likeCount:{
                    $size:"$likeDetails",
                },
                ownerDetails:{
                    $first:"$ownerDetails",
                },
                isLiked:{
                    $cond:{
                        if:{$in:[re.user?._id,"$likeDetails.likedBy"]},
                        then:true,
                        else:false,
                    }
                }
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                content: 1,
                ownerDetails: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1
            }
        }
     ])

     return res.status(200).json(new apiResponse(200, tweets, "Tweets fetched successfully"));
});

export { createTweet, updateTweet, deleteTweet, getUserTweets };
