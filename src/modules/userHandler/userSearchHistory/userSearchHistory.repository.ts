import { DataSource, Repository } from "typeorm";
import { User } from "../../userHandler/user/model/user.model";
import { UserSearchHistoryEntity } from "./entity/userSearchHistory.entity";
import { UserSearchHistory } from "./model/userSearchHistory.model";

export class UserSearchHistoryRepository {
    private userSearchHistoryRepo: Repository<UserSearchHistoryEntity>;

    constructor(private appDataSource: DataSource) {
        this.userSearchHistoryRepo = appDataSource.getRepository(
            UserSearchHistoryEntity
        );
    }

    public async create(user: User, query: string): Promise<void> {
        await this.userSearchHistoryRepo.save({ user, query });
    }

    public async getUserSearchHistory(
        user: User,
        limit: number = 5
    ): Promise<UserSearchHistory[] | null> {
        const [response, total] = await this.userSearchHistoryRepo.findAndCount(
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
