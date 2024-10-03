import { BadRequestError } from "../../../../utility/http-errors";
import { User } from "../../user/model/user.model";
import { UserService } from "../../user/user.service";
import { UserRelationEntity } from "../../userRelation/entity/userRelation.entity";
import { UserRelationService } from "../../userRelation/userRelation.service";
import { Notification } from "../model/notification.model";
import { CreateUserNotification } from "./model/userNotification.model";
import { UserNotificationRepository } from "./userNotification.repository";

export class UserNotificationService {
    constructor(
        private userNotificationRepo: UserNotificationRepository,
        private userService: UserService,
        private userRelationService: UserRelationService
    ) {}

    public createUserNotification(userNotification: CreateUserNotification) {
        return this.userNotificationRepo.create(userNotification);
    }

    public findByUserAndNotification(user: User, notification: Notification) {
        return this.userNotificationRepo.findByUserandNotification(
            user,
            notification
        );
    }

    public makeUserNotificationAsRead(
        userNotificationId: string,
        username: string
    ) {
        this.userNotificationRepo.makeUserNotificationAsRead(
            userNotificationId,
            username
        );
    }

    public async userNotif(
        username: string,
        notification: Notification
    ): Promise<CreateUserNotification | undefined> {
        const mentionedUser = await this.userService.getUserByUsername(
            username
        );
        if (mentionedUser && notification) {
            const userNotification: CreateUserNotification = {
                user: mentionedUser,
                notification: notification,
                isRead: false,
            };
            return userNotification;
        }
    }

    public async getSenderFollowers(user: User) {
        return this.userRelationService.allFolloweList(user);
    }

    public async getNotifReadStatus(user: User, notification: Notification) {
        const notif = await this.userNotificationRepo.checkExistance(
            user,
            notification
        );
        if (!notif) {
            throw BadRequestError;
        }
        return notif.isRead;
    }

    public async getUserNotifUnreadCount(user: User) {
        const { response, total } =
            await this.userNotificationRepo.getUserNotifUnreadCount(user);

        let count = 0;
        count = total;
        for (const notif of response) {
            if (
                notif.user.username === notif.notification.sender.username ||
                notif.user.username !== notif.notification.recipient.username
            ) {
                count -= 1;
            }
        }

        return count;
    }

    public async getUserFollowingsNotifUnreadCount(
        followings: UserRelationEntity[]
    ) {
        const { response, total } =
            await this.userNotificationRepo.getUserFollowingsNotifUnreadCount(
                followings
            );

        let count = 0;
        count = total;
        for (const notif of response) {
            if (
                notif.user.username === notif.notification.sender.username ||
                notif.user.username === notif.notification.recipient.username
            ) {
                count -= 1;
            }
        }

        return count;
    }
}
