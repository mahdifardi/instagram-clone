import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { PostService } from "../../postHandler/post/post.service";
import { User } from "../user/model/user.model";
import { SavedPostRepository } from "./savedPost.repository";

export class SavedPostService {
    constructor(
        private savedPostRepo: SavedPostRepository,
        private postService: PostService
    ) {}

    public async getPostSaveStatus(user: User, postId: string) {
        const post = await this.postService.getPost(postId);
        const save = await this.savedPostRepo.checkExistance(user, post);
        const save_status = save ? true : false;
        return save_status;
    }

    public async savePost(user: User, postId: string) {
        const post = await this.postService.getPost(postId);
        const save_status = await this.getPostSaveStatus(user, postId);

        if (save_status) {
            throw new BadRequestError();
        }

        await this.savedPostRepo.create(user, post);
        await this.getSavedPostCount(post.id);
        return { message: "Post saved" };
    }

    public async unSavePost(user: User, postId: string) {
        const post = await this.postService.getPost(postId);
        const save_status = await this.getPostSaveStatus(user, postId);

        if (!save_status) {
            throw new BadRequestError();
        }

        await this.savedPostRepo.delete(user, post);
        await this.getSavedPostCount(post.id);
        return { message: "Post unsaved" };
    }

    private async getSavedPostCount(postId: string) {
        const count = await this.savedPostRepo.getPostSavedCount(postId);
        await this.postService.setSavedCount(postId, count);
    }

    public async getSavedPosts(username: string, page: number, limit: number) {
        return await this.savedPostRepo.getSavedPosts(username, page, limit);
    }
}
