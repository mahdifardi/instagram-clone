import { BadRequestError } from "../../../utility/http-errors";
import { Thread } from "../thread/model/thread.model";
import { User } from "../user/model/user.model";
import { MessageRepository } from "./message.repository";
import { toShownMessage } from "./model/message.model";

export class MessageService {
    constructor(private messageRepo: MessageRepository) {}

    public async newMessage(
        sender: User,
        thread: Thread,
        base_url: string,
        text?: string,
        image?: string
    ) {
        const newMesg = await this.messageRepo.create({
            sender,
            thread,
            text,
            image,
        });
        return toShownMessage(newMesg, base_url);
    }

    public async getUnreadThreadCount(
        threadId: string,
        otherParticipantUsername: string
    ) {
        const { data, total } = await this.messageRepo.getUnreadThreadMessages(
            threadId,
            otherParticipantUsername
        );

        return total;
    }

    public async markThreadAsRead(
        threadId: string,
        otherParticipantUsername: string
    ) {
        const { data, total } = await this.messageRepo.getUnreadThreadMessages(
            threadId,
            otherParticipantUsername
        );

        data.map(
            async (message) =>
                await this.messageRepo.markMessageAsRead(message.id)
        );
    }

    public async getThreadLastMessage(threadId: string) {
        return await this.messageRepo.getThreadLastMessage(threadId);
    }

    public async deleteMessage(messageId: string) {
        const message = await this.messageRepo.getMessageById(messageId);
        if (!message) {
            throw new BadRequestError()
        }
        await this.messageRepo.delete(messageId);
    }

    public async getThreadMessages(
        thread: Thread,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const messages = await this.messageRepo.getThreadMessages(
            thread,
            page,
            limit
        );

        return {
            data: messages.data.map((message) =>
                toShownMessage(message, baseUrl)
            ),
            total: messages.total,
        };
    }
}
