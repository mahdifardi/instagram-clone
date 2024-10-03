import {
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../../userHandler/user/entity/user.entity";
import { CommentEntity } from "../../comment/entity/comment.entity";

@Entity("commentLikes")
export class CommentLikeEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.commentLikes)
    user!: UserEntity;

    @ManyToOne(() => CommentEntity, (comment) => comment.likes)
    comment!: CommentEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
