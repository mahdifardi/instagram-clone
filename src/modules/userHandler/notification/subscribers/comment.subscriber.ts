import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { CreateNotification } from "../model/notification.model";
import { CommentEntity } from "../../../postHandler/comment/entity/comment.entity";
import { NotificationEntity } from "../entity/notification.entity";
import { UserNotificationEntity } from "../userNotification/entity/userNotification.entity";
import { UserNotificationService } from "../userNotification/userNotification.service";

@EventSubscriber()
export class CommentSubscriber
    implements EntitySubscriberInterface<CommentEntity>
{
    constructor(private userNotificationsService: UserNotificationService) {}

    listenTo() {
        return CommentEntity;
    }

    async afterInsert(event: InsertEvent<CommentEntity>): Promise<void> {
        const entity = event.entity as CommentEntity;

        if (entity.parent) {
            return;
        }

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
            type: "comment",
            post: entity.post,
            comment: entity,
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
}
