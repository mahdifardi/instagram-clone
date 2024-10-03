import { DataSource, Repository } from "typeorm";
import { PostSearchHistoryEntity } from "./entity/postSearchHistory.entity";
import { User } from "../../userHandler/user/model/user.model";
import { PostSearchHistory } from "./model/postSearchHistory.model";

export class PostSearchHistoryRepository {
    private postSearchHistoryRepo: Repository<PostSearchHistoryEntity>;

    constructor(private appDataSource: DataSource) {
        this.postSearchHistoryRepo = appDataSource.getRepository(
            PostSearchHistoryEntity
        );
    }

    public async create(user: User, query: string): Promise<void> {
        await this.postSearchHistoryRepo.save({ user, query });
    }

    public async getPostSearchHistory(
        user: User,
        limit: number = 5
    ): Promise<PostSearchHistory[] | null> {
        const [response, total] = await this.postSearchHistoryRepo.findAndCount(
            {
                take: limit,
                where: [{ user: { username: user.username } }],
                order: {
                    createdAt: "DESC",
                },
                relations: ["user"],
            }
        );

        return response;
    }
}
