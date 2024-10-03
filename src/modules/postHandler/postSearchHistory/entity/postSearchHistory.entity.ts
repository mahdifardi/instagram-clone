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

@Entity("postSearchHistory")
export class PostSearchHistoryEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.postSearchHistory)
    user!: User;

    @Column()
    query!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
