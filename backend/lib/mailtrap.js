import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv"

dotenv.config()

const Token = process.env.MAILTRAP_TOKEN

export const mailtrapClient = new MailtrapClient({
    token: Token
});

export const sender = {
    name:process.env.MAILTRAP_NAME,
    email:process.env.MAILTRAP_EMAIL
}