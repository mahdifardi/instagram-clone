import { MessageEntity } from "../../message/entity/message.entity";
import { Message } from "../../message/model/message.model";
import { User } from "../../user/model/user.model";

export interface Thread {
    id: string;
    participants: User[];
    messages: Message[];
}

export type CreateThread = Omit<Thread, "messages" | "id">;

export interface ListThread {
    threadId: string;
    username: string;
    firstname: string;
    lastname: string;
    profilePicture: string;
    unreadMessages: number;
    updatedAt: Date;
    lastMessageSenderUsername: string;
    lastMessageType: "image" | "text";
    lastMessageText: string | undefined;
}

export const toListThread = (
    thread: Thread,
    user: User,
    unreadMessages: number,
    lastMessage: MessageEntity,
    baseUrl: string
): ListThread => {
    return {
        threadId: thread.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        unreadMessages: unreadMessages,
        updatedAt: lastMessage.createdAt,
        lastMessageSenderUsername: lastMessage.sender.username,
        lastMessageType: lastMessage.image ? "image" : "text",
        lastMessageText: lastMessage.text
            ? lastMessage.text
            : "یک عکس فرستاده شده است",
    };
};
