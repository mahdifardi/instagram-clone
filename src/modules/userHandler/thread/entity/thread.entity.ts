import {
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MessageEntity } from "../../message/entity/message.entity";
import { UserEntity } from "../../user/entity/user.entity";
import { User } from "../../user/model/user.model";
import { Message } from "../../message/model/message.model";

@Entity("threads")
export class ThreadEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToMany(() => MessageEntity, (message) => message.thread)
    messages!: Message[];

    @ManyToMany(() => UserEntity)
    // @JoinTable({
    //     name: "thread_participants",
    //     joinColumn: { name: "thread_id", referencedColumnName: "id" },
    //     inverseJoinColumn: { name: "user_id", referencedColumnName: "id" },
    // })
    @JoinTable()
    participants!: User[];
}
