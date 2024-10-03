import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./modules/userHandler/user/entity/user.entity";
import { PasswordResetTokenEntity } from "./modules/userHandler/forgetPassword/entity/forgetPassword.entity";
import { PostEntity } from "./modules/postHandler/post/entity/post.entity";
import { UserRelationEntity } from "./modules/userHandler/userRelation/entity/userRelation.entity";
import { PostLikeEntity } from "./modules/postHandler/postLike/entity/postLike.entity";
import { CommentEntity } from "./modules/postHandler/comment/entity/comment.entity";
import { SavedPostsEntity } from "./modules/userHandler/savedPost/entity/savedPost.entity";
import { CommentLikeEntity } from "./modules/postHandler/commentLike/entity/commentLike.entity";
import { NotificationEntity } from "./modules/userHandler/notification/entity/notification.entity";
import { UserNotificationEntity } from "./modules/userHandler/notification/userNotification/entity/userNotification.entity";
import { MessageEntity } from "./modules/userHandler/message/entity/message.entity";
import { ThreadEntity } from "./modules/userHandler/thread/entity/thread.entity";
import { PostSearchHistoryEntity } from "./modules/postHandler/postSearchHistory/entity/postSearchHistory.entity";
import { UserSearchHistoryEntity } from "./modules/userHandler/userSearchHistory/entity/userSearchHistory.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [
        UserEntity,
        PasswordResetTokenEntity,
        PostEntity,
        UserRelationEntity,
        PostLikeEntity,
        CommentLikeEntity,
        CommentEntity,
        SavedPostsEntity,
        NotificationEntity,
        UserNotificationEntity,
        MessageEntity,
        ThreadEntity,
        PostSearchHistoryEntity,
        UserSearchHistoryEntity,
    ],
    migrations: [],
    subscribers: [],
});
