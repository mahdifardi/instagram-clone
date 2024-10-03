import { User } from "../../../userHandler/user/model/user.model";
import { Post } from "../../post/model/post.model";

export interface Comment {
    id: string;
    post: Post;
    user: User;
    text: string;
    parent?: Comment;
    children?: Comment[];
    like_count: number;
}

export type CreateComment = Omit<Comment, "id" | "like_count">;

export interface CommentsList {
    data: Comment[];
    total: number;
}

export type PostCommentList = Omit<Comment, "post" | "user"> & {
    username: string;
    profilePicture: string;
    firstname: string;
    lastname: string;
    like_status: boolean;
};

export const toPostCommentList = (
    comment: Comment,
    like_status: boolean,
    baseUrl: string,
): PostCommentList => {
    const { user, post, ...commentDetails } = comment;
    return {
        ...commentDetails,
        username: user.username,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        firstname: user.firstname,
        lastname: user.lastname,
        like_status,
    };
};

export type CommentWithUsername = Omit<Comment, "post" | "user"> & {
    postId: string;
    username: string;
};

export const toCommentWithUsername = (
    comment: Comment
): CommentWithUsername => {
    const { user, post, ...commentDetails } = comment;
    return {
        ...commentDetails,
        postId: post.id,
        username: user.username,
    };
};
