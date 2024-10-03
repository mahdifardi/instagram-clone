import { BadRequestError } from "../../../utility/http-errors";
import { User } from "../../userHandler/user/model/user.model";
import { PostService } from "../post/post.service";
import { PostLikeRepository } from "./postLike.repository";

export class PostLikeService {
    constructor(
        private postLikeRepo: PostLikeRepository,
        private postService: PostService
    ) {}

    public async getLikeStatus(user: User, postId: string) {
        const post = await this.postService.getPost(postId);
        const like = await this.postLikeRepo.checkExistance(user, post);
        const like_status = like ? true : false;
        return like_status;
    }

    public async likePost(user: User, postId: string) {
        const post = await this.postService.getPost(postId);
        const like_status = await this.getLikeStatus(user, postId);

        if (like_status) {
            throw new BadRequestError();
        }

        await this.postLikeRepo.create(user, post);
        await this.getPostLikeCount(post.id);
        return { message: "Post liked" };
    }

    public async unLikePost(user: User, postId: string) {
        const post = await this.postService.getPost(postId);
        const like_status = await this.getLikeStatus(user, postId);

        if (!like_status) {
            throw new BadRequestError();
        }

        await this.postLikeRepo.delete(user, post);
        await this.getPostLikeCount(post.id);
        return { message: "Post unliked" };
    }

    private async getPostLikeCount(postId: string) {
        const count = await this.postLikeRepo.getPostLikeCount(postId);
        await this.postService.setLikeCount(postId, count);
    }
}
