import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { PostEntity } from "../../../postHandler/post/entity/post.entity";
import { CommentEntity } from "../../../postHandler/comment/entity/comment.entity";
import { PostLikeEntity } from "../../../postHandler/postLike/entity/postLike.entity";
import { CommentLikeEntity } from "../../../postHandler/commentLike/entity/commentLike.entity";
import { UserRelationEntity } from "../../userRelation/entity/userRelation.entity";
import { NotificationEntity } from "../../notification/entity/notification.entity";
import { UserNotificationEntity } from "../../notification/userNotification/entity/userNotification.entity";
import { MessageEntity } from "../../message/entity/message.entity";
import { ThreadEntity } from "../../thread/entity/thread.entity";
import { SavedPostsEntity } from "../../savedPost/entity/savedPost.entity";
import { PostSearchHistoryEntity } from "../../../postHandler/postSearchHistory/entity/postSearchHistory.entity";

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ default: "" })
    profilePicture!: string;

    @Column({ default: "" })
    firstname!: string;

    @Column({ default: "" })
    lastname!: string;

    @Column({
        type: "enum",
        enum: ["public", "private"],
        default: "public",
    })
    profileStatus!: "public" | "private";

    @Column({ default: "" })
    bio!: string;

    @OneToMany(() => PostEntity, (post) => post.user)
    posts!: PostEntity[];

    @Column({ default: 0 })
    post_count!: number;

    @OneToMany(() => UserRelationEntity, (relation) => relation.follower)
    followers!: UserRelationEntity[];

    @Column({ default: 0 })
    follower_count!: number;

    @OneToMany(() => UserRelationEntity, (relation) => relation.following)
    followings!: UserRelationEntity[];

    @Column({ default: 0 })
    following_count!: number;

    @OneToMany(() => CommentEntity, (relation) => relation.user)
    comments!: CommentEntity[];

    @OneToMany(() => PostLikeEntity, (relation) => relation.user)
    postLikes!: PostLikeEntity[];

    @OneToMany(() => CommentLikeEntity, (relation) => relation.user)
    commentLikes!: CommentLikeEntity[];

    @OneToMany(() => SavedPostsEntity, (relation) => relation.user)
    savedPosts!: SavedPostsEntity[];

    @OneToMany(() => NotificationEntity, (relation) => relation.recipient)
    recipientNotifications!: NotificationEntity[];

    @OneToMany(() => NotificationEntity, (relation) => relation.sender)
    senderNotifications!: NotificationEntity[];

    @OneToMany(
        () => UserNotificationEntity,
        (userNotification) => userNotification.user
    )
    userNotifications!: UserNotificationEntity[];

    @OneToMany(() => MessageEntity, (message) => message.sender)
    messages!: MessageEntity[];

    @ManyToMany(() => ThreadEntity, (thread) => thread.participants)
    threads!: ThreadEntity[];

    @OneToMany(() => PostSearchHistoryEntity, (history) => history.user)
    postSearchHistory!: PostSearchHistoryEntity[];

    @OneToMany(() => UserNotificationEntity, (history) => history.user)
    userSearchHistory!: UserNotificationEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
