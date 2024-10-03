import { DataSource, Repository } from "typeorm";
import { SavedPostsEntity } from "./entity/savedPost.entity";
import { Post } from "../../postHandler/post/model/post.model";
import { SavedPost } from "./model/savedPost.model";
import { User } from "../user/model/user.model";

export class SavedPostRepository {
    private savedPostRepo: Repository<SavedPostsEntity>;
    constructor(private appDataSource: DataSource) {
        this.savedPostRepo = appDataSource.getRepository(SavedPostsEntity);
    }

    public async create(user: User, post: Post): Promise<void> {
        await this.savedPostRepo.save({ user, post });
    }

    public async delete(user: User, post: Post): Promise<void> {
        await this.savedPostRepo.softDelete({
            user: user,
            post: { id: post.id },
        });
    }

    public async checkExistance(
        user: User,
        post: Post
    ): Promise<SavedPost | null> {
        const response = await this.savedPostRepo.findOne({
            where: {
                user: { username: user.username },
                post: { id: post.id },
            },
        });

        return response;
    }

    public async getPostSavedCount(postId: string): Promise<number> {
        const postSavedCount = await this.savedPostRepo.count({
            where: { post: { id: postId } },
        });
        return postSavedCount;
    }

    public async getSavedPosts(username: string, page: number, limit: number) {
        const [response, total] = await this.savedPostRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                user: { username },
            },
            relations: ["user", "post", "post.user"],
            order: {
                createdAt: "DESC",
            },
        });

        return { data: response.map((record) => record.post), total: total };
    }
}
