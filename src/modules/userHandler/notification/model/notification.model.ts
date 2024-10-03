import { Comment } from "../../../postHandler/comment/model/comment.model";
import {
    Post,
    toPostWithImage,
} from "../../../postHandler/post/model/post.model";
import { User } from "../../user/model/user.model";
import {
    toUserList,
    UserList,
    ProfileFollowStatus,
    PFollowStatus,
} from "../../userRelation/model/userRelation.model";
import { NotificationEntity } from "../entity/notification.entity";

export type NotificationTypes =
    | "requestAccepted"
    | "followRequest"
    | "followed"
    | "comment"
    | "mention"
    | "like";

export interface Notification {
    id: string;
    recipient: User;
    sender: User;
    type: NotificationTypes;
    post?: Post;
    comment?: Comment;
}

export type NotificationWithRead = Notification & {
    isRead: boolean;
};

export type CreateNotification = Omit<Notification, "id">;

export interface notificationData {
    data: NotificationEntity[];
    total: number;
}

export type userNotificationsResponse = {
    data: ShownNotification[];
    meta: {
        total: number;
        page: number;
        totalPage: number;
        limit: number;
    };
};

export type ShownNotification = {
    id: string;
    recipient: UserList;
    sender: UserList;
    type: NotificationTypes;
    post?: Post;
    comment?: Comment;
    isRead: boolean;
};

export const toShownNotification = (
    notification: NotificationWithRead,
    baseUrl: string
): ShownNotification => {
    const { recipient, sender, comment, post, ...commentDetails } =
        notification;
    return {
        ...commentDetails,
        id: notification.id,
        recipient: toUserList(recipient, baseUrl),
        sender: toUserList(sender, baseUrl),
        post: post ? toPostWithImage(post, baseUrl) : undefined,
        comment: comment ? comment : undefined,
        isRead: notification.isRead,
    };
};

export const toShownSenderFollowerNotification = (
    notification: NotificationWithRead,
    baseUrl: string
): ShownNotification => {
    const { recipient, sender, comment, post, ...commentDetails } =
        notification;
    return {
        ...commentDetails,
        id: notification.id,
        recipient: toUserList(sender, baseUrl),
        sender: toUserList(recipient, baseUrl),
        post: post ? toPostWithImage(post, baseUrl) : undefined,
        comment: comment ? comment : undefined,
        isRead: notification.isRead,
    };
};

export type NotificationWithFollowStatus = Notification & {
    followStatus: PFollowStatus;
    reverseFollowStatus: PFollowStatus;
};

export const toNotificationWithFollowStatus = (
    notification: NotificationEntity,
    followStatus: ProfileFollowStatus
): NotificationWithFollowStatus => {
    return {
        ...notification,
        followStatus: followStatus.followStatus,
        reverseFollowStatus: followStatus.reverseFollowStatus,
    };
};

export const toNotificationWithFollowStatusWithIsRead = (
    notification: NotificationWithFollowStatus,
    isRead: boolean
): NotificationWithRead => {
    return {
        ...notification,
        isRead: isRead,
    };
};

export type userFollowingNotificationsResponse = {
    data: NotificationWithFollowStatus[];
    meta: {
        total: number;
        page: number;
        totalPage: number;
        limit: number;
    };
};
