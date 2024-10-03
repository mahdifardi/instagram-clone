import {
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { PostEntity } from "../../../postHandler/post/entity/post.entity";
import { UserEntity } from "../../user/entity/user.entity";

@Entity("savedPosts")
export class SavedPostsEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.savedPosts)
    user!: UserEntity;

    @ManyToOne(() => PostEntity, (post) => post.saves)
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
