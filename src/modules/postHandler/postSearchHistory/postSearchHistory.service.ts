import { User } from "../../userHandler/user/model/user.model";
import { PostSearchHistoryRepository } from "./postSearchHistory.repository";

export class PostSearchHistoryService {
    constructor(private postSearchHistoryRepo: PostSearchHistoryRepository) {}
    public async createPostSearchHistory(user: User, query: string) {
        const duplicateStatus = await this.handleDuplicates(user, query);
        if (!duplicateStatus) {
            await this.postSearchHistoryRepo.create(user, query);
        }
    }

    public async getPostSearchHistory(user: User, limit: number) {
        return await this.postSearchHistoryRepo.getPostSearchHistory(
            user,
            limit
        );
    }

    private async handleDuplicates(user: User, query: string) {
        const LIMIT = 5;
        const history = await this.getPostSearchHistory(user, LIMIT);
        if (!history) {
            return false;
        }
        for (const record of history) {
            if (record.query === query) {
                return true;
            }
        }
        return false;
    }
}
