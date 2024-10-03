import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../../userHandler/user/entity/user.entity";
import { User } from "../../../userHandler/user/model/user.model";

@Entity("userSearchHistory")
export class UserSearchHistoryEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.userSearchHistory)
    user!: User;

    @Column()
    query!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
