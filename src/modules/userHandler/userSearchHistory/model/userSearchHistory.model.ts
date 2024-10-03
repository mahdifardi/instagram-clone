import { User } from "../../../userHandler/user/model/user.model";

export interface UserSearchHistory {
    query: string;
    user: User;
}
