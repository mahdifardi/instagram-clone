import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { PostEntity } from "../../post/entity/post.entity";
import { UserEntity } from "../../../userHandler/user/entity/user.entity";
import { Comment } from "../model/comment.model";
import { CommentLike } from "../../commentLike/model/commentLike.model";
import { CommentLikeEntity } from "../../commentLike/entity/commentLike.entity";
import { NotificationEntity } from "../../../userHandler/notification/entity/notification.entity";

@Entity("comments")
export class CommentEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => PostEntity, (post) => post.comments)
    post!: PostEntity;

    @ManyToOne(() => UserEntity, (user) => user.comments)
    user!: UserEntity;

    @Column()
    text!: string;

    @OneToMany(() => CommentLikeEntity, (commentLike) => commentLike.comment)
    likes!: CommentLike[];

    @Column({ default: 0 })
    like_count!: number;

    @OneToMany(() => CommentEntity, (comment) => comment.parent)
    children!: Comment[];

    @ManyToOne(() => CommentEntity, (comment) => comment.children)
    parent!: Comment;

    @ManyToOne(() => NotificationEntity, (notification) => notification.comment)
    notifications!: NotificationEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
