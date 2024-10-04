import express from 'express';

const router = express.Router();

import { protectRoute } from "../middleware/auth.middleware.js"
import { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, getConnectionRequests,
    getUserConnections, removeConnection, getConnectionStatus
 } from "../controllers/connection.controller.js";

router.post("/request/:userId", protectRoute, sendConnectionRequest);
router.put("/accept/:requestId", protectRoute, acceptConnectionRequest)
router.put("/request/:requestTd", protectRoute, rejectConnectionRequest)
router.get("/request/", protectRoute, getConnectionRequests)
router.get("/request", protectRoute, getUserConnections)
router.delete("/:userId", protectRoute, removeConnection)
router.get("/status/:userId", protectRoute, getConnectionStatus)

export default router