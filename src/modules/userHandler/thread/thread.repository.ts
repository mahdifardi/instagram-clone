import { ArrayContains, DataSource, In, Repository } from "typeorm";
import { ThreadEntity } from "./entity/thread.entity";
import { CreateThread, Thread } from "./model/thread.model";
import { User } from "../user/model/user.model";

export class ThreadRepository {
    private threadRepo: Repository<ThreadEntity>;
    constructor(private appDataSource: DataSource) {
        this.threadRepo = appDataSource.getRepository(ThreadEntity);
    }

    public async create(thread: CreateThread): Promise<Thread> {
        return await this.threadRepo.save(thread);
    }

    public async getUserThreads(user: User, page: number, limit: number) {
        const query = this.threadRepo
            .createQueryBuilder("thread")
            .leftJoinAndSelect("thread.participants", "participant") // Fetch all participants
            .leftJoin("thread.participants", "userParticipant") // Join again to filter by the specific user
            .leftJoin("thread.messages", "message") // Join the messages relation
            .where("userParticipant.username = :username", {
                username: user.username,
            }) // Ensure the user is part of the thread
            .andWhere("message.id IS NOT NULL") // Ensure there are messages
            .skip((page - 1) * limit)
            .take(limit);

        const [threads, total] = await query.getManyAndCount();

        return { data: threads, total: total };
    }

    public async getAllUserThreads(user: User) {
        const query = this.threadRepo
            .createQueryBuilder("thread")
            .leftJoinAndSelect("thread.participants", "participant") // Fetch all participants
            .leftJoin("thread.participants", "userParticipant") // Join again to filter by the specific user
            .leftJoin("thread.messages", "message") // Join the messages relation
            .where("userParticipant.username = :username", {
                username: user.username,
            }) // Ensure the user is part of the thread
            .andWhere("message.id IS NOT NULL"); // Ensure there are messages

        const [threads, total] = await query.getManyAndCount();

        return { data: threads, total: total };
    }

    public async getThreadByParticipants(participants: User[]) {
        const participantsUsernames = participants.map(
            (participant) => participant.username
        );

        // Build the query to find threads with the exact participants
        const threads = await this.threadRepo
            .createQueryBuilder("thread")
            .leftJoinAndSelect("thread.participants", "participant")
            .where("participant.username IN (:...usernames)", {
                usernames: participantsUsernames,
            })
            .groupBy("thread.id")
            .having("COUNT(participant.id) = :count", {
                count: participantsUsernames.length,
            })
            .select("thread.id")
            .getMany(); // Use getMany() to get multiple results if needed

        // Fetch detailed thread data
        if (threads.length > 0) {
            const detailedThread = await this.threadRepo
                .createQueryBuilder("thread")
                .leftJoinAndSelect("thread.participants", "participant")
                .where("thread.id = :threadId", { threadId: threads[0].id })
                .getOne();

            return detailedThread || null;
        }

        return null;
    }

    public async getThreadById(threadId: string): Promise<Thread | null> {
        return await this.threadRepo.findOne({
            where: { id: threadId },
        });
    }
}
