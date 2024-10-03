import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    SoftRemoveEvent,
} from "typeorm";
import { PostLikeEntity } from "../../../postHandler/postLike/entity/postLike.entity";
import { CreateNotification } from "../model/notification.model";
import { NotificationEntity } from "../entity/notification.entity";
import { UserNotificationService } from "../userNotification/userNotification.service";
import { UserNotificationEntity } from "../userNotification/entity/userNotification.entity";

@EventSubscriber()
export class PostLikeSubscriber
    implements EntitySubscriberInterface<PostLikeEntity>
{
    constructor(private userNotificationsService: UserNotificationService) {}

    listenTo() {
        return PostLikeEntity;
    }

    async afterInsert(event: InsertEvent<PostLikeEntity>): Promise<void> {
        const entity = event.entity as PostLikeEntity;

        const notificationRepo =
            event.manager.getRepository(NotificationEntity);
        const userNotificationRepo = event.manager.getRepository(
            UserNotificationEntity
        );

        if (entity.user.username === entity.post.user.username) {
            return;
        }
        const notification: CreateNotification = {
            recipient: entity.post.user,
            sender: entity.user,
            type: "like",
            post: entity.post,
        };
        const notif = await notificationRepo.save(notification);

        const userNotification = await this.userNotificationsService.userNotif(
            entity.post.user.username,
            notif
        );
        if (userNotification) {
            await userNotificationRepo.save(userNotification);
        }

        const senderFollowers =
            await this.userNotificationsService.getSenderFollowers(entity.user);

        for (const senderFollower of senderFollowers) {
            if (senderFollower.follower.id != entity.post.user.id) {
                const userNotification =
                    await this.userNotificationsService.userNotif(
                        senderFollower.follower.username,
                        notif
                    );
                if (userNotification) {
                    await userNotificationRepo.save(userNotification);
                }
            }
        }
    }

    async afterSoftRemove(
        event: SoftRemoveEvent<PostLikeEntity>
    ): Promise<void> {
        const entity = event.entity as PostLikeEntity;

        const notificationRepo =
            event.manager.getRepository(NotificationEntity);

        const notif = await notificationRepo.findOne({
            where: {
                sender: { username: entity.user.username },
                post: { id: entity.post.id },
                type: "like",
            },
            relations: ["userNotifications", "post", "sender"],
        });

        if (notif) {
            await notificationRepo.softRemove(notif);
        }
    }
}
