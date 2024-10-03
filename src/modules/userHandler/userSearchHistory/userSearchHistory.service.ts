import { User } from "../../userHandler/user/model/user.model";
import { UserSearchHistoryRepository } from "./userSearchHistory.repository";

export class UserSearchHistoryService {
    constructor(private userSearchHistoryRepo: UserSearchHistoryRepository) {}
    public async createUserSearchHistory(user: User, query: string) {
        const duplicateStatus = await this.handleDuplicates(user, query);
        if (!duplicateStatus) {
            await this.userSearchHistoryRepo.create(user, query);
        }
    }

    public async getUserSearchHistory(user: User, limit: number) {
        return await this.userSearchHistoryRepo.getUserSearchHistory(
            user,
            limit
        );
    }

    private async handleDuplicates(user: User, query: string) {
        const LIMIT = 5;
        const history = await this.getUserSearchHistory(user, LIMIT);
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
