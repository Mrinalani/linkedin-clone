
import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const sendConnectionRequest = async(req,res) => {
    try {
        const { userId } = req.params; 
        const senderId = req.user._id;

        if(senderId.toString() === userId.toString()){
            return res.status(400).json({message: "You can't send a request to yourself"})
        }

        if(req.user.connection.includes(userId)){
            return res.status(400).json({message: "You are alredy connected"})
        }

        const existingRequest = await ConnectionRequest.findOne({
            sender: senderId,
            recipient: userId,
            status: "pending"
        })

        if(existingRequest){
            return res.status(400).json({message: "A connection request alredy exists"})
        }

        const newRequest = new ConnectionRequest({
            sender: senderId,
            recipient: userId,
        })

        await newRequest.save()

        return res.status(2011).json({message: "connection request sent successfully"})
    } catch (error) {
        console.log("Error in sendConnectionRequest:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const acceptConnectionRequest = async(req,res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await ConnectionRequest.findById(requestId)
        .populate("sender", "name email username")
        .populate("recipeent", "name username")

        if(!request){
            return res.status(404).json({message: "Connection request not found"})
        }

        if(request.recipient._id.toString() !== userId.toString()){
            return res.status(400).json({message: "Not authorized to accept this request"})
        }

        if(request.status !== "pending"){
            return res.status(400).json({message: "This request has alredy been pending"})
        }

        request.status = "accepted"
        await request.save();

        await User.findByIdAndUpdate(request.sender._id, {$addToSet: {userId}})
        await User.findByIdAndDelete(userId, { $addToSet: { connections: request.sender._id} })

        const notification = new Notification({
            recipient: request.sender._id,
            type: "connectionAccepted",
            relatedUser: userId,
        })

        await notification.save();

        res.status(200).json({message: "Connection accepted successfully"});

        const senderEmail = request.sender.email;
        const senderName = request.sender.name;
        const recipientName = request.recipient.name;
        const profileUrl = process.env.CLIENT_URL + "/profile" + request.recipient.username;

        try {
            await sendConnectionAcceptedEmail(senderEmail, senderName, recipientName, profileUrl);
        } catch (error) {
            console.error("error in sendEmailAcceptedEmail", error)
        }
    } catch (error) {
        console.log("Error in acceptConnectionRequest:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const rejectConnectionRequest = async(req,res) => {
    try {
       const { requestId } = req.params;
       const userId = req.user;

       const request = await ConnectionRequest.findById(requestId);

       if(request.recipient.toString() !== userId.toString()){
        return res.status(403).json({ message: "you are not authorised to reject this request"})
       }

       if(request.status !== "pending") {
        return res.status(400).json({ message: "This request has alredy been  processed"})
       }

       request.status = "rejected";
       await request.save();

       return res.status(200).json({ message: "Connection request rejected"})
    } catch (error) {
        console.log("Error in rejectConnectionRequest:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const getConnectionRequests = async(req,res) => {
    try {
        const userId = req.user._id;

        const requests = await ConnectionRequest.findById({recipient: userId, status: "pending"})
        .populate("sender", "name username profilePicture headline connections")

        return res.status(200).json(requests)
        
    } catch (error) {
        console.log("Error in getConnectionRequest:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const getUserConnections = async(req,res) => {
    try {
        const userId = req.user._id;

        const user = User.findById(userId)
        .populate("connections", "name username profilePicture headline connections");

        return res.status(200).json(user.connections);
    } catch (error) {
        console.log("Error in getUserConnection:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const removeConnection = async(req,res) => {
    try {
        const myId = req.user._id;
        const { userId } = req.params;

        await User.findByIdAndUpdate(myId, { $pull: {connections: userId}});
        await User.findByIdAndUpdate(userId, { $pull: {connections: myId}});

        return res.status(200).json("Connection removed successfully")
    } catch (error) {
        console.log("Error in removeConnection:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const getConnectionStatus = async(req,res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user._id;

        const currentUser = req.user;
        if(currentUser.connections.includes(targetUserId)){
            return res.status(200).json({status: "connected"});
        }

        const pendingRequest = req.findOne({
            $or:[
                {sender: currentUserId, recipient: targetUserId},
                {sender: targetUserId, recipient: currentUserId}
            ],
            status: "pending"
        })

        if(pendingRequest){
            if(pendingRequest.sender.toString() === currentUserId.toString()){
                return res.status(200).json({status: "pending"})
            }else{
                return res.status(200).json({status: "received", requestId: pendingRequest_id})
            }
        }

        res.status(200).json({status: "Not connected"})
    } catch (error) {
        console.log("Error in getConnectionStatus:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}