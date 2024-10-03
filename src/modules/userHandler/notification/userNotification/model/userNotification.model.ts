import { User } from "../../../user/model/user.model";
import { Notification } from "../../model/notification.model";

export interface UserNotification {
    id: string;
    user: User;
    notification: Notification;
    isRead: boolean;
}

export type CreateUserNotification = Omit<UserNotification, "id">;
