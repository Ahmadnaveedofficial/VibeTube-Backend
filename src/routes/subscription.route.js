import { Router } from "express";
import {toggleSubscrription, getUserChannelSubscribers, getSubscribedChannels} from "../controllers/subscription.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router =Router();

router.use(verifyJWT);

router.route("/c/:channelId").get(getUserChannelSubscribers).post(toggleSubscrription);
router .route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
