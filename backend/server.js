import express from "express"
import dotenv from "dotenv"

import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'
import postRoutes from './routes/postRoute.js'
import notificationRoutes from './routes/notificationRoute.js'
import connectionRoutes from './routes/connection.route.js'

import { connectDb } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json())
app.use(cookieParser())

// routes
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/users', userRoute)
app.use('/api/v1/posts', postRoutes)
app.use('/ap1/v1/notifications', notificationRoutes)
app.use('/api/v1/connections', connectionRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
    connectDb()
})