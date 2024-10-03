import { User } from "../../../userHandler/user/model/user.model";
import { Post } from "../../post/model/post.model";

export interface PostLike {
    post: Post;
    user: User;
}
