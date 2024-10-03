import { NotFoundError } from "../../../utility/http-errors";
import { MessageService } from "../message/message.service";
import { User } from "../user/model/user.model";
import { UserService } from "../user/user.service";
import { toListThread } from "./model/thread.model";
import { ThreadRepository } from "./thread.repository";

export class ThreadService {
    constructor(
        private threadRepo: ThreadRepository,
        private messageService: MessageService,
        private userService: UserService
    ) {}

    public async addNewThread(participants: User[]) {
        return await this.threadRepo.create({ participants });
    }

    public async getUserThreads(
        user: User,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const threads = await this.threadRepo.getUserThreads(user, page, limit);
        const shownThreads = [];
        for (const thread of threads.data) {
            const lastMessage = await this.messageService.getThreadLastMessage(
                thread.id
            );
            const otherParticipant = thread.participants.filter(
                (participant) => participant.username !== user.username
            );
            const unreadMessages =
                await this.messageService.getUnreadThreadCount(
                    thread.id,
                    otherParticipant[0].username
                );
            shownThreads.push(
                toListThread(
                    thread,
                    otherParticipant[0],
                    unreadMessages,
                    lastMessage,
                    baseUrl
                )
            );
        }

        const response = {
            data: shownThreads,
            meta: {
                page: page,
                limit: limit,
                total: shownThreads.length,
                totalPage: Math.ceil(shownThreads.length / limit),
            },
        };

        return response;
    }

    public async getThread(user: User, username: string) {
        const otherParticipant = await this.userService.getUserByUsername(
            username
        );

        if (!otherParticipant) {
            throw new NotFoundError();
        }
        const existingThread = await this.threadRepo.getThreadByParticipants([
            user,
            otherParticipant,
        ]);

        const thread = existingThread
            ? existingThread
            : await this.addNewThread([user, otherParticipant]);

        await this.messageService.markThreadAsRead(
            thread.id,
            otherParticipant.username
        );
        return thread.id;
    }

    public async getThreadHistory(
        threadId: string,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const thread = await this.getThreadById(threadId);

        const threadMessages = await this.messageService.getThreadMessages(
            thread,
            page,
            limit,
            baseUrl
        );

        const response = {
            data: threadMessages.data.reverse(),
            threadId: thread.id,
            meta: {
                page: page,
                limit: limit,
                total: threadMessages.total,
                totalPage: Math.ceil(threadMessages.total / limit),
            },
        };

        return response;
    }

    public async getThreadById(threadId: string) {
        const thread = await this.threadRepo.getThreadById(threadId);
        if (!thread) {
            throw new NotFoundError();
        }
        return thread;
    }

    public async getUserUnreadMessagesCount(user: User) {
        const threads = await this.threadRepo.getAllUserThreads(user);

        let sum: number = 0;

        for (const thread of threads.data) {
            const otherParticipant = thread.participants.filter(
                (participant) => participant.username !== user.username
            );
            const unreadMessages =
                await this.messageService.getUnreadThreadCount(
                    thread.id,
                    otherParticipant[0].username
                );
            sum += unreadMessages;
        }

        return sum;
    }
}
