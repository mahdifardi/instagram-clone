import { HttpError } from "../../utility/http-errors";
import { SendMailDto } from "./dto/sendEmail.dto";
import nodemailer from "nodemailer";

export class EmailService {
    private transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        logger: false,
        debug: false,
        secure: false,
    });

    constructor() {}

    public async sendEmail(dto: SendMailDto) {
        const mailOptions = {
            from: "Cgram App",
            to: dto.reciever,
            subject: dto.subject,
            html: dto.html,
        }

        try {
            await this.transporter.sendMail(mailOptions);
            return {
                message: "Email successfully sent",
            };
        } catch (error) {
            throw new HttpError(500, "Error sending email");
        }
    }
}
