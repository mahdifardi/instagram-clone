import { NotFoundError } from "../../../utility/http-errors";
import { User } from "../../userHandler/user/model/user.model";
import { PostService } from "../post/post.service";
import { CommentRepository } from "./comment.repository";
import { CommentDto } from "./dto/comment.dto";
import { Comment, toCommentWithUsername } from "./model/comment.model";

export class CommentService {
    constructor(
        private commentRepo: CommentRepository,
        private postService: PostService
    ) {}

    public async createComment(user: User, commentDto: CommentDto) {
        const post = await this.postService.getPost(commentDto.postId);

        const comment = commentDto.commentId
            ? await this.getCommentById(commentDto.commentId)
            : undefined;

        const createdComment = await this.commentRepo.create({
            post,
            user,
            text: commentDto.text,
            parent: comment,
        });

        await this.getCommentCount(post.id);

        return toCommentWithUsername(createdComment);
    }

    public async getCommentById(commentId: string): Promise<Comment> {
        const comment = await this.commentRepo.findById(commentId);
        if (!comment) {
            throw new NotFoundError();
        }
        return comment;
    }

    public async getComments(postId: string, page: number, limit: number) {
        return await this.commentRepo.getComments(postId, page, limit);
    }

    private async getCommentCount(postId: string) {
        const count = await this.commentRepo.getCommentCount(postId);
        await this.postService.setCommentCount(postId, count);
    }

    public async setLikeCount(commentId: string, like_count: number) {
        return await this.commentRepo.setLikeCount(commentId, like_count);
    }
}
