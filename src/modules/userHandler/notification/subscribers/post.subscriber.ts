import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
} from "typeorm";
import { CreateNotification } from "../model/notification.model";
import { PostEntity } from "../../../postHandler/post/entity/post.entity";
import { UserService } from "../../user/user.service";
import { User } from "../../user/model/user.model";
import { UserNotificationService } from "../userNotification/userNotification.service";
import { NotificationEntity } from "../entity/notification.entity";
import { UserNotificationEntity } from "../userNotification/entity/userNotification.entity";
import { NotificationService } from "../notification.service";

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<PostEntity> {
    constructor(
        private notificationService: NotificationService,
        private userService: UserService,
        private userNotificationsService: UserNotificationService
    ) {}

    listenTo() {
        return PostEntity;
    }

    async afterInsert(event: InsertEvent<PostEntity>): Promise<void> {
        const entity = event.entity;
        if ("mentions" in entity) {
            if (entity.mentions.length > 0) {
                const notificationRepo =
                    event.manager.getRepository(NotificationEntity);
                const userNotificationRepo = event.manager.getRepository(
                    UserNotificationEntity
                );

                for (const mention of entity.mentions) {
                    if (entity.user.username !== mention) {
                        const notification = await this.tagsNotification(
                            event,
                            mention
                        );
                        if (notification) {
                            const notif = await notificationRepo.save(
                                notification
                            );
                            const userNotification =
                                await this.userNotificationsService.userNotif(
                                    mention,
                                    notif
                                );

                            if (userNotification) {
                                await userNotificationRepo.save(
                                    userNotification
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    async afterUpdate(event: UpdateEvent<PostEntity>): Promise<void> {
        const entity = event.entity;
        if (
            entity &&
            event.updatedColumns.some(
                (column) => column.propertyName === "mentions"
            )
        ) {
            const notificationRepo =
                event.manager.getRepository(NotificationEntity);
            const userNotificationRepo = event.manager.getRepository(
                UserNotificationEntity
            );

            const oldNotifs = await notificationRepo.find({
                where: {
                    type: "mention",
                    post: { id: entity.id },
                },
                relations: ["recipient", "userNotifications", "post"],
            });

            for (const notif of oldNotifs) {
                if (!entity.mentions.includes(notif.recipient.username)) {
                    await notificationRepo.softRemove(notif);
                }
            }
            const oldMentions = oldNotifs.map(
                (notif) => notif.recipient.username
            );

            for (const mention of entity.mentions) {
                if (
                    entity.user.username !== mention &&
                    !oldMentions.includes(mention)
                ) {
                    const notification = await this.tagsUpdateNotification(
                        event,
                        mention
                    );
                    if (notification) {
                        const notif = await notificationRepo.save(notification);
                        const userNotification =
                            await this.userNotificationsService.userNotif(
                                mention,
                                notif
                            );

                        if (userNotification) {
                            await userNotificationRepo.save(userNotification);
                        }
                    }
                }
            }
        }
    }

    private async getUserByUsername(mention: string): Promise<User | null> {
        return await this.userService.getUserByUsername(mention);
    }

    private async tagsNotification(
        event: InsertEvent<PostEntity>,
        mention: string
    ) {
        const mentionedUser = await this.getUserByUsername(mention);
        if (mentionedUser) {
            const notification: CreateNotification = {
                recipient: mentionedUser,
                sender: event.entity.user,
                type: "mention",
                post: event.entity,
            };
            return notification;
        }
    }

    private async tagsUpdateNotification(
        event: UpdateEvent<PostEntity>,
        mention: string
    ): Promise<CreateNotification | undefined> {
        const entity = event.entity as PostEntity;
        if (entity) {
            const mentionedUser = await this.getUserByUsername(mention);

            if (mentionedUser) {
                const notification: CreateNotification = {
                    recipient: mentionedUser,
                    sender: entity.user,
                    type: "mention",
                    post: entity,
                };
                return notification;
            }
        }
        return undefined;
    }
}
