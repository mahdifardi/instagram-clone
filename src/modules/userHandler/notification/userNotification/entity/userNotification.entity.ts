import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../../../user/entity/user.entity";
import { NotificationEntity } from "../../entity/notification.entity";

@Entity("userNotifications")
export class UserNotificationEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.userNotifications, {
        nullable: false,
    })
    user!: UserEntity;

    @ManyToOne(
        () => NotificationEntity,
        (notification) => notification.userNotifications,
        {
            nullable: false,
        }
    )
    notification!: NotificationEntity;

    @Column({ default: false })
    isRead!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
