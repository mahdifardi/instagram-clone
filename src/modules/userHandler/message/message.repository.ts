import { DataSource, Repository } from "typeorm";
import { MessageEntity } from "./entity/message.entity";
import { CreateMessage, Message } from "./model/message.model";
import { Thread } from "../thread/model/thread.model";

export class MessageRepository {
    private messageRepo: Repository<MessageEntity>;
    constructor(private appDataSource: DataSource) {
        this.messageRepo = appDataSource.getRepository(MessageEntity);
    }

    public async create(message: CreateMessage): Promise<MessageEntity> {
        return await this.messageRepo.save(message);
    }

    public async delete(messageId: string) {
        await this.messageRepo.softDelete({ id: messageId });
    }

    public async getMessageById(messageId:string){
        return await this.messageRepo.findOne({where: {id: messageId}})
    }

    public async getThreadLastMessage(
        threadId: string
    ): Promise<MessageEntity> {
        const lastMessage = await this.messageRepo.find({
            where: {
                thread: {
                    id: threadId,
                },
            },
            relations: ["thread", "sender"],
            take: 1,
            order: { createdAt: "DESC" },
        });

        return lastMessage[0];
    }

    public async getThreadMessages(
        thread: Thread,
        page: number,
        limit: number
    ) {
        const [response, total] = await this.messageRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                thread: {
                    id: thread.id,
                },
            },
            relations: ["thread", "sender"],

            order: {
                createdAt: "DESC",
            },
        });

        return { data: response, total: total };
    }

    public async getUnreadThreadMessages(
        threadId: string,
        otherParticipantUsername: string
    ) {
        const [response, total] = await this.messageRepo.findAndCount({
            where: {
                thread: {
                    id: threadId,
                },
                sender: { username: otherParticipantUsername },
                isRead: false,
            },
            relations: ["thread", "sender"],
        });

        return { data: response, total: total };
    }

    public async markMessageAsRead(messageId: string) {
        await this.messageRepo.update({ id: messageId }, { isRead: true });
    }
}
