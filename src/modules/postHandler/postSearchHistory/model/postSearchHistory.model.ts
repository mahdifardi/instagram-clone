import { User } from "../../../userHandler/user/model/user.model";

export interface PostSearchHistory {
    query: string;
    user: User;
}
