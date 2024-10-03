import {
    AfterInsert,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";
import { FollowStatus } from "../model/userRelation.model";

@Entity("userRelations")
export class UserRelationEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.followers)
    follower!: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.followings)
    following!: UserEntity;

    @Column({
        type: "enum",
        enum: [
            "request pending",
            "followed",
            "unfollowed",
            "request accepted",
            "request rejected",
            "close",
            "blocked",
            "unblocked",
            "request rescinded",
            "follower deleted",
        ],
    })
    followStatus!: FollowStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
