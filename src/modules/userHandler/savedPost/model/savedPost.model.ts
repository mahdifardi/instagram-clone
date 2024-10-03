import { Post } from "../../../postHandler/post/model/post.model";
import { User } from "../../user/model/user.model";

export interface SavedPost {
    user: User;
    post: Post;
}
