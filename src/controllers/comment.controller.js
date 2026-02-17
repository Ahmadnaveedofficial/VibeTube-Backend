import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/handler.js";


// get all comments of a video

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit } = req.query;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(400, "invalid video ID");
    }

    const commentsAggregate = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
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
                content: 1,
                createdAt: 1,
                likeCount: 1,
                owner: {
                    username: 1,
                    fullname: 1,
                    "avatar.url": 1
                },
                isLiked: 1
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const comments = await Comment.aggregatePaginate({
        commentsAggregate,
        options
    });

    return res.status(200).json(
        new apiResponse(200, comments, "comments fetched successfully")
    );
});

// add comment to a video

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new apiError(400, "content is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user?._id,
    });

    if (!comment) {
        throw new apiError(500, "failed to add comments in this video try again");
    }

    return res.status(200).json(
        new apiResponse(200, comment, "comment add Successfully")
    );
});

// update a comment

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new apiError(400, "content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(400, "only comment owner can update their comment");
    }

    const updateComment = await Comment.findByIdAndUpdate(comment?._id,
        {
            $set: {
                content: content,
            }
        },
        {
            new: true,
        }
    );


    if (!updateComment) {
        throw new apiError(500, "Failed to edit comment please try again");
    }

    return res
        .status(200).json(
            new apiResponse(200, updateComment, "Comment edited successfully")
        );
});

// delete a comment

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new apiError(400, "invalid comment id ");
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(400, "only comment owner can delete their comment");
    }

    await Comment.findByIdAndDelete(commentId);

    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user
    });

    return res.status(200).json(
        new apiResponse(200, { commentId }, "Comment deleted successfully")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };



