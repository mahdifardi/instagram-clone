import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";
import { ThreadEntity } from "../../thread/entity/thread.entity";
import { Thread } from "../../thread/model/thread.model";
import { User } from "../../user/model/user.model";

@Entity("messages")
export class MessageEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.messages)
    sender!: User;

    @ManyToOne(() => ThreadEntity, (thread) => thread.messages)
    thread!: Thread;

    @Column({ nullable: true })
    text!: string;

    @Column({ nullable: true })
    image!: string;

    @Column({ default: false })
    isRead!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
