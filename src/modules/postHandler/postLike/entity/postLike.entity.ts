import {
    AfterInsert,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../../userHandler/user/entity/user.entity";
import { PostEntity } from "../../post/entity/post.entity";

@Entity("postLikes")
export class PostLikeEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.postLikes)
    user!: UserEntity;

    @ManyToOne(() => PostEntity, (post) => post.likes)
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
