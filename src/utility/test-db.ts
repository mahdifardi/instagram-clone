import { DataType, newDb } from "pg-mem";
import { DataSource } from "typeorm";
import { UserEntity } from "../modules/userHandler/user/entity/user.entity";
import { PasswordResetTokenEntity } from "../modules/userHandler/forgetPassword/entity/forgetPassword.entity";
import { v4 } from "uuid";
import { PostEntity } from "../modules/postHandler/post/entity/post.entity";
import { UserRelationEntity } from "../modules/userHandler/userRelation/entity/userRelation.entity";
import { PostLikeEntity } from "../modules/postHandler/postLike/entity/postLike.entity";
import { CommentEntity } from "../modules/postHandler/comment/entity/comment.entity";
import { SavedPostsEntity } from "../modules/userHandler/savedPost/entity/savedPost.entity";
import { CommentLikeEntity } from "../modules/postHandler/commentLike/entity/commentLike.entity";
import { NotificationEntity } from "../modules/userHandler/notification/entity/notification.entity";
import { UserNotificationEntity } from "../modules/userHandler/notification/userNotification/entity/userNotification.entity";
import { MessageEntity } from "../modules/userHandler/message/entity/message.entity";
import { ThreadEntity } from "../modules/userHandler/thread/entity/thread.entity";
import { PostSearchHistoryEntity } from "../modules/postHandler/postSearchHistory/entity/postSearchHistory.entity";
import { UserSearchHistoryEntity } from "../modules/userHandler/userSearchHistory/entity/userSearchHistory.entity";

export const createTestDb = async () => {
    // Create a new in-memory database
    const db = newDb();

    // Register functions that pg-mem does not implement natively
    db.public.registerFunction({
        name: "current_database",
        implementation: () => "test_db",
    });

    db.public.registerFunction({
        name: "version",
        implementation: () => "PostgreSQL 14.2",
    });

    db.public.registerFunction({
        name: "obj_description",
        args: [DataType.text, DataType.text],
        returns: DataType.text,
        implementation: () => "test",
    });

    db.registerExtension("uuid-ossp", (schema) => {
        schema.registerFunction({
            name: "uuid_generate_v4",
            returns: DataType.uuid,
            implementation: v4,
            impure: true,
        });
    });

    // Create a TypeORM DataSource instance with the pg-mem adapter
    const dataSource = new DataSource({
        type: "postgres",
        driver: db.adapters.createPg(), // Create the driver directly from the pg-mem instance
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
        synchronize: true,
        logging: false,
        subscribers: [],
    });

    // Initialize the DataSource
    await dataSource.initialize();

    return dataSource;
};
