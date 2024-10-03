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
import { UserEntity } from "../../../userHandler/user/entity/user.entity";
import { CommentEntity } from "../../comment/entity/comment.entity";
import { PostLikeEntity } from "../../postLike/entity/postLike.entity";
import { SavedPostsEntity } from "../../../userHandler/savedPost/entity/savedPost.entity";
import { NotificationEntity } from "../../../userHandler/notification/entity/notification.entity";

@Entity("Posts")
export class PostEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("varchar", { array: true })
    images!: string[];

    @Column()
    caption!: string;

    @Column("varchar", { array: true })
    tags!: string[];

    @Column("varchar", { array: true })
    mentions!: string[];

    @ManyToOne(() => UserEntity, (user) => user.posts)
    user!: UserEntity;

    @OneToMany(() => PostLikeEntity, (postLike) => postLike.post)
    likes!: PostLikeEntity[];

    @Column({ default: 0 })
    like_count!: number;

    @OneToMany(() => CommentEntity, (comment) => comment.post)
    comments!: CommentEntity[];

    @Column({ default: 0 })
    comment_count!: number;

    @OneToMany(() => SavedPostsEntity, (savedPost) => savedPost.post)
    saves!: SavedPostsEntity[];

    @Column({ default: 0 })
    saved_count!: number;

    @OneToMany(() => NotificationEntity, (notification) => notification.post)
    notifications!: NotificationEntity[];

    @Column({
        type: "enum",
        enum: ["close", "normal"],
    })
    close_status!: "close" | "normal";

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
