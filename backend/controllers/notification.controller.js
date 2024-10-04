import Notification from "../models/notification.model.js"

export const getUserNotifications = async(req, res) => {
    try {
        const notifications = Notification.find({recipient: req.user._id})
        .sort({createdAt: -1})
        .populate("relatedUser", "name username profilePicture")
        .populate("relatedPost", "content image");

        res.status(200).json(notifications)
        
    } catch (error) {
        console.log("Error in getUserNotifications:", error.message)
        res.status(500).json({message: "Internal Server Error"})
        
    }
}

export const markNotificationAsRead = async(req, res) => {
    const notificationId = req.params.id;

    try {
        const notification = await Notification.findByIdAndUpdate(
            {_id: notificationId, recipient: req.user._id},
            {read: true},
            {new: true}
        )

        return res.status(200).json(notification)
    } catch (error) {
        console.log("Error in markNotificationAsRead:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const deleteNotification = async(req,res) => {
    const notificationId = req.params;
    const userId = req.user._id

    try {
        const notification = Notification.findById(notificationId)

        if(!notification){
            res.status(400).json({massage: "User Not Found"})
        }

        if(notification.recipient.toString() !== userId.toString()){
            res.status(400).json({message: "you are not authorized to delete this post"})
        }

        await Notification.findByIdAndDelete(notificationId)
        
    } catch (error) {
        
    }
}