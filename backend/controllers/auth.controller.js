import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import  jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandler.js";

export const signup = async (req, res)=>{
     try {
        const {name, username, email, password} = req.body;
        console.log("this is controller part")

        const existingEmail = await User.findOne({email});
        if(existingEmail){
            console.log(existingEmail)
            return res.status(400).json({message:"Email alredy exist"})
        }
        console.log(existingEmail)

        const existingUserName = await User.findOne({username});
        if(existingUserName){
            return res.status(400).json({message:"UserName alredy exist"})
        }

        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 8 character"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt)

        const user = new User({
            name,
            username,
            email,
            password: hashedPassword,
        })
        await user.save();
        console.log(user)

        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_TOKEN, {expiresIn:"3d"})
        res.cookie("jwt-linkedin", token,{
            httpOnly:true, // prevent xss attack
            maxAge: 3*24*60*60*1000,
            sameSite: "strict", // prevent csrf attacks
            secure: process.env.NODE_ENV === "production" // prevents man-in-the-middle attacks
        })

        res.status(201).json({message: "user registered successfully"})

        // send welcome email

        const profileUrl = process.env.CLIENT_URL +"/profile" + user.username;

        try {
            await sendWelcomeEmail(user.email, user.name, profileUrl)
        } catch (EmailError) {
            console.error("Error sending welcome email", EmailError)   
        }


     } catch (error) {
        console.log("Error in signup", error.message)
        res.status(500).json({message: "Internal server error"})
        
     }
}

export const login = async(req, res)=>{
    const {username, password} = req.body;
    console.log("password:", password)

    try {
        const user = await User.findOne({username})
        if(!user){
            res.status(400).json({message: "Invalid username"})
        }
        console.log(user.username)
    
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            res.status(400).json({message:"invalid password"})
        }
    
        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_TOKEN, {expiresIn:"3d"})
        res.cookie("jwt-linkedin", token,{
            httpOnly:true, // prevent xss attack
            maxAge: 3*24*60*60*1000,
            sameSite: "strict", // prevent csrf attacks
            secure: process.env.NODE_ENV === "production" // prevents man-in-the-middle attacks
        })
    
        res.json({message: "logged in successfully"})
        
    } catch (error) {
        console.error("error in login controller", error)  
        res.status(500).json({message:"Server error"})   
    }
}

export const logout = (req, res)=>{
    res.clearCookie("jwt-linkedin");
    res.json({message: "user logged out successfully"})
}

export const getCurrentUser = (req,res)=>{
    try {
    res.json(req.user)
    } catch (error) {
        console.log("Error in getCurrentUser:", error.message)
        res.status(500).json({message: "Internal Server Error"})
        
    }
}