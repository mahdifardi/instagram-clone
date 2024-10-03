import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { CreateNotification } from "../model/notification.model";
import { UserRelationEntity } from "../../userRelation/entity/userRelation.entity";
import { UserNotificationService } from "../userNotification/userNotification.service";
import { NotificationEntity } from "../entity/notification.entity";
import { UserNotificationEntity } from "../userNotification/entity/userNotification.entity";

@EventSubscriber()
export class UserRelationSubscriber
    implements EntitySubscriberInterface<UserRelationEntity>
{
    private close_trigger: UserRelationEntity | undefined;
    constructor(private userNotificationsService: UserNotificationService) {
        this.close_trigger = undefined;
    }

    listenTo() {
        return UserRelationEntity;
    }

    async afterInsert(event: InsertEvent<UserRelationEntity>): Promise<void> {
        const entity = event.entity as UserRelationEntity;

        const notificationRepo =
            event.manager.getRepository(NotificationEntity);
        const userNotificationRepo = event.manager.getRepository(
            UserNotificationEntity
        );

        if (entity.follower.username === entity.following.username) {
            return;
        }

        if (
            entity.followStatus === "request accepted" ||
            entity.followStatus === "followed"
        ) {
            if (entity.followStatus === "request accepted") {
                await notificationRepo.softDelete({
                    recipient: entity.following,
                    sender: entity.follower,
                    type: "followRequest",
                });
                const notification: CreateNotification = {
                    recipient: entity.follower,
                    sender: entity.following,
                    type: "requestAccepted",
                };
                const notif = await notificationRepo.save(notification);

                const userNotification =
                    await this.userNotificationsService.userNotif(
                        entity.follower.username,
                        notif
                    );
                if (userNotification) {
                    await userNotificationRepo.save(userNotification);
                }
            }
            if (this.close_trigger) {
                if (
                    this.close_trigger.follower.username ===
                        entity.follower.username &&
                    this.close_trigger.following.username ===
                        entity.following.username
                ) {
                    this.close_trigger = undefined;
                    return;
                }
            }
            const notification: CreateNotification = {
                recipient: entity.following,
                sender: entity.follower,
                type: "followed",
            };
            const notif = await notificationRepo.save(notification);

            const userNotification =
                await this.userNotificationsService.userNotif(
                    entity.following.username,
                    notif
                );
            if (userNotification) {
                await userNotificationRepo.save(userNotification);
            }

            const senderFollowers =
                await this.userNotificationsService.getSenderFollowers(
                    entity.follower
                );

            for (const senderFollower of senderFollowers) {
                const userNotification =
                    await this.userNotificationsService.userNotif(
                        senderFollower.follower.username,
                        notif
                    );
                if (userNotification) {
                    await userNotificationRepo.save(userNotification);
                }
            }
        } else if (entity.followStatus === "request pending") {
            const notification: CreateNotification = {
                recipient: entity.following,
                sender: entity.follower,
                type: "followRequest",
            };
            const notif = await notificationRepo.save(notification);

            const userNotification =
                await this.userNotificationsService.userNotif(
                    entity.following.username,
                    notif
                );
            if (userNotification) {
                await userNotificationRepo.save(userNotification);
            }
        } else if (
            entity.followStatus === "request rejected" ||
            entity.followStatus === "request rescinded"
        ) {
            await notificationRepo.softDelete({
                recipient: entity.following,
                sender: entity.follower,
                type: "followRequest",
            });
        } else if (
            entity.followStatus == "unfollowed" ||
            entity.followStatus == "follower deleted"
        ) {
            await notificationRepo.softDelete({
                recipient: entity.following,
                sender: entity.follower,
                type: "followed",
            });
            await notificationRepo.softDelete({
                recipient: entity.follower,
                sender: entity.following,
                type: "requestAccepted",
            });
        } else if (entity.followStatus === "blocked") {
            await notificationRepo.softDelete({
                recipient: entity.following,
                sender: entity.follower,
                type: "followed",
            });
            await notificationRepo.softDelete({
                recipient: entity.follower,
                sender: entity.following,
                type: "requestAccepted",
            });
        } else if (entity.followStatus === "close") {
            this.close_trigger = entity;
        }
    }
}
