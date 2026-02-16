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

    const updatePlaylist=await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $pull:{
                videos:videoId,
            }
        },
        {
            new:true,
        }
    );

         return res .status(200).json(
            new apiResponse(200,updatePlaylist,"Removed video from playlist successfully")
        );
});