 import cloudinary from "../lib/cloudinary.js"
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"

import { sendCommentNotification } from "../emails/emailHandler.js"

export const getFeedPosts = async(req,res) => {
    try {
        const posts = await Post.find({author:{$in: req.user.connections}})
        .populate("author", "name username profilePicture headline")
        .populate("comments.user", "name profilePicture")
        .sort({createdAt: -1})

        res.status(200).json(posts)
    } catch (error) {
        console.log("Error in getFeedPosts:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const createPost = async(req,res) => {
    try {
        const {content,image} = req.body;

        let newPost;

        if(image){
            const imgResult = await cloudinary.uploader.upload(image)

            newPost = new Post({
                author: req.user._id,
                content,
                image: imgResult.url
            })
        }else{
            newPost = new Post({
                author: req.user._id,
                content,
            })
        }

        await newPost.save()

        res.status(201).json(newPost)
    } catch (error) {
        console.log("Error in createPost:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const deletePost = async(req,res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId)

        if(!post){
            return res.status(404).json({message: "Post not found"})
        }

        if(post.author.toString() !== userId.toString()){
            return res.status(403).json({message: "you are not authorized to delete this post"})
        }

        //delete image from cloudinary
        if(post.image){
            await cloudinary.uploader.destroy(post.image.split('/').pop().split('.')[0])
        }

        await Post.findByIdAndDelete(userId)
        res.status(200).json({message: "Post deleted successfully"})
    } catch (error) {
        console.log("Error in deletePost:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const getPostById = async(req,res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId)
        .populate("author", "name username profilePicture headline")
        .populate("comments.user", "name profilePicture username headline")

        res.status(200).json(post)
        
    } catch (error) {
        console.log("Error in getPostById:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const createComment = async(req,res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: {comments: {user: userId, content}}
            },
            {new: true}
        ).populate("author", "name email username headline profilePicture")

        if(post.author.toString() !== userId.toString()){
            const newNotification = new Notification({
                recipient: post.author,
                type: "comment",
                relatedUser: userId,
                relatedPost: postId
            })

            await newNotification.save()
            
            try {
                const postUrl = process.env.CLIENT_URL + "/post/" + postId
                await sendCommentNotification(
                    post.author.email,
                    post.author.name,
                    req.user.name,
                    postUrl,
                    content
                )
                
            } catch (error) {
                console.log("Error in sending comment notification email:", error)
            }
        }

        res.status(200).json(post)
        
    } catch (error) {
        console.log("Error in createComment:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const likePost = async(req,res) => {
    try {
        const postId = req.params.id;
        const post = await post.findById(postId);
        const userId = req.user._id;

        if(post.likes.include(userId)){
            post.likes = post.likes.filter(id => id.toString() !== userId.toString)
        }else{
            post.likes = post.likes.push(userId)
        }

        if(post.author.toString() !== userId.toString()){
            const newNotification = new Notification({
                recipient: post.author,
                type: "like",
                relatedUser: userId,
                relatedPost: postId
            })
           await newNotification.save()
        }
        await post.save();

        res.status(200).json(post)
    } catch (error) {
        console.log("Error in postComment:", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}