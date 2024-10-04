
import { mailtrapClient, sender } from "../lib/mailtrap.js"
import { createWelcomeEmailTemplate } from "./emailTemplate.js"

export const sendWelcomeEmail = async(email, name, profileUrl) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to unLinked",
            html: createWelcomeEmailTemplate(name, profileUrl),
            category: "welcome"
        })

        console.log("welcome email send succesfully", response)
    } catch (error) {
        throw error
        
    }
}

export const sendCommentNotification = async(recipientEmail, recipientName, commenterName, postUrl, commentContent) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "New comment on your post",
            html: createCommentNotificationEmailTemplate(recipientName, commenterName, postUrl, commentContent),
            category: "comment_notification"
        })

        console.log("Comment notification email send succesfully", response)
    } catch (error) {
        throw error
        
    }
}

export const sendConnectionAcceptedEmail = async(senderEmail, senderName, recipientName, profileUrl) => {
    const recipient = [{senderEmail}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: `${recipientName} has accepted your connection request`,
            html: createConnectionAcceptedEmailTemplate(senderName, recipientName, profileUrl),
            category: "comment_notification"
        })

        console.log("Comment notification email send succesfully", response)
    } catch (error) {
        throw error
        
    }
}