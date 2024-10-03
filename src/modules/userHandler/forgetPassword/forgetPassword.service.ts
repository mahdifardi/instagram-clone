import { hashGenerator } from "../../../utility/hash-generator";
import {
    ForbiddenError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { EmailService } from "../../email/email.service";
import { PasswordResetTokenRepository } from "./forgetPassword.repository";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

export class ForgetPasswordService {
    constructor(
        private passwordResetTokenRepo: PasswordResetTokenRepository,
        private emailService: EmailService
    ) {}

    public async createToken(username: string) {
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 2);
        const token = crypto.randomUUID();
        const token_hash = await hashGenerator(token);

        const record = await this.passwordResetTokenRepo.create({
            token: token_hash,
            expiration: expirationTime,
            username: username,
        });

        return { id: record.id, token: token };
    }

    public async deleteUsedToken(id: string) {
        await this.passwordResetTokenRepo.delete(id);
    }

    public async checkToken(token: string) {
        let id, resetToken;
        try {
            [id, resetToken] = token.split("~");
        } catch (e) {
            throw new UnauthorizedError();
        }

        const dbtoken = await this.passwordResetTokenRepo.findById(id);
        if (!dbtoken) {
            throw new UnauthorizedError();
        }
        if (dbtoken.expiration.getTime() < new Date().getTime()) {
            this.passwordResetTokenRepo.delete(dbtoken.id);
            throw new ForbiddenError();
        }
        const isMatch = await bcrypt.compare(resetToken, dbtoken.token);
        if (!isMatch) {
            throw new UnauthorizedError();
        }
        await this.deleteUsedToken(id);
        return dbtoken.username;
    }

    public sendForgetPasswordEmail(email: string, id: string, token: string) {
        const htmlTemplate = fs.readFileSync(
            path.join(__dirname, "email-template/index.html"),
            "utf-8"
        );

        const resetLink = `${process.env.RESET_PASS_LINK}/reset-password/${id}~${token}`;
        const htmlContent = htmlTemplate.replace("{{resetLink}}", resetLink);

        const mailContent = {
            reciever: email,
            subject: "Password Reset",
            html: htmlContent,
        };
        return this.emailService.sendEmail(mailContent);
    }
}
