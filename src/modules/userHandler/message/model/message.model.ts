import { Thread } from "../../thread/model/thread.model";
import { User } from "../../user/model/user.model";
import { MessageEntity } from "../entity/message.entity";

export interface Message {
    sender: User;
    thread: Thread;
    text?: string;
    image?: string;
    isRead: boolean;
}

export type CreateMessage = Omit<Message, "isRead">;

export interface ShownMessage {
    messageId: string;
    senderUsername: string;
    senderFirstname: string;
    senderLastname: string;
    senderProfilePicture: string;
    messageType: "image" | "text";
    messageContent?: string;
    createdAt: Date;
    isRead: boolean;
}

export const toShownMessage = (
    message: MessageEntity,
    baseUrl: string
): ShownMessage => {
    return {
        messageId: message.id,
        senderUsername: message.sender.username,
        senderFirstname: message.sender.firstname,
        senderLastname: message.sender.lastname,
        senderProfilePicture: message.sender.profilePicture
            ? `${baseUrl}/api/images/profiles/${message.sender.profilePicture}`
            : "",
        messageType: message.image ? "image" : "text",
        messageContent: message.text
            ? message.text
            : `${baseUrl}/api/images/messages/${message.image}`,
        createdAt: message.createdAt,
        isRead: message.isRead,
    };
};
