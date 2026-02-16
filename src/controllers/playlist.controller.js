import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import asyncHandler from "../utils/handler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.models.js"


// create playlist

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new apiError(400, "name and description both are the required")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id
    });

    if (!playlist) {
        throw new apiError(500, "failed to create playlist");
    }

    return res.status(200).json(
        new apiResponse(200, "playlist created successfully")
    );
});

// update Playlist

const updatePlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { playlistId } = re.params

    if (!name || !description) {
        throw new apiError(400, "name and description both are the required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "invalid Playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(400, "only owner can edit this playlist");
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(playlist?._id, {
        $set: {
            name: name,
            description: description,
        }
    }, {
        new: true
    }
    )

    return res.status(200).json(
        new apiResponse(200, updatePlaylist, "playlist update successfully")
    );
});

// delete playlist

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "invalid Playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(400, "only owner can delete this playlist");
    }

    await Playlist.findByIdAndDelete(playlist?._id);

    return res.status(200).json(200,
        new apiResponse(200, {}, "playlist delete successfully")
    );
});

// add video to playlist

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new apiError(400, "invalid playlist and video Id");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);


    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (!video) {
        throw new apiError(404, "video not found");
    }

    if ((playlist.owner?.toString() && video.owner.toString()) !==
        req.user?._id.toString()) {

        throw new apiError(400, "only owner can add video to their playList");
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(playlist?._id,
        {
            $addToSet: {
                videos: videoId,
            }
        },
        {
            new: true
        }
    );

    if (!updatePlaylist) {
        throw new apiError(400, "failed to add video on playlist try again");
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200, updatePlaylist, "Added video to playlist successfully"
            )
        );
});

// remove video from playlist

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid PlaylistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    if (!video) {
        throw new apiError(404, "video not found");
    }

    if ((playlist.owner?.toString() && video.owner.toString()) !==
        req.user?._id.toString()) {
        throw new apiError(404, "only owner can remove video from thier playlist");
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $pull: {
                videos: videoId,
            }
        },
        {
            new: true,
        }
    );

    return res.status(200).json(
        new apiResponse(200, updatePlaylist, "Removed video from playlist successfully")
    );
});

// get Playlist by id 

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "playlist not found");
    }

    const playlistVideos = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            }
        },
        {
            $lookup: {
                from: "video",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $match: {
                "videos.isPublished": true,
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
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views",
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1
                },
                owner: {
                    username: 1,
                    fullname: 1,
                    "avatar.url": 1
                }
            }
        }
    ])

    return res.status(200).json(
        new apiResponse(200, playlistVideos, "playlist fetched successfully")
    );
});

// get user playlist

const getUserPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new apiError(400, "invalid user Id");
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localFields: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views",
                },
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1
            }
        }
    ]);

    return res.status(200).json(
        new apiResponse(200,playlists,"user playlists fetched successfully")
    );
});

export {
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistById,
    getUserPlaylist
};