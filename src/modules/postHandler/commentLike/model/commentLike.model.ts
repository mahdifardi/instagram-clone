import { User } from "../../../userHandler/user/model/user.model";
import { Comment } from "../../comment/model/comment.model";

export interface CommentLike {
    comment: Comment;
    user: User;
}
