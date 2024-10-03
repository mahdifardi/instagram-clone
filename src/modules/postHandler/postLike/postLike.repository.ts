import { DataSource, Repository } from "typeorm";
import { Post } from "../post/model/post.model";
import { User } from "../../userHandler/user/model/user.model";
import { PostLikeEntity } from "./entity/postLike.entity";
import { PostLike } from "./model/postLike.model";

export class PostLikeRepository {
    private postLikeRepo: Repository<PostLikeEntity>;

    constructor(private appDataSource: DataSource) {
        this.postLikeRepo = appDataSource.getRepository(PostLikeEntity);
    }

    public async create(user: User, post: Post): Promise<void> {
        await this.postLikeRepo.save({ user, post });
    }

    public async delete(user: User, post: Post): Promise<void> {
        const postLike = await this.postLikeRepo.findOne({
            where: {
                user: { username: user.username },
                post: { id: post.id },
            },
            relations: ["user", "post"],
        });

        if (postLike) {
            await this.postLikeRepo.softRemove(postLike);
        }
    }

    public async checkExistance(
        user: User,
        post: Post
    ): Promise<PostLike | null> {
        const response = await this.postLikeRepo.findOne({
            where: {
                user: { username: user.username },
                post: { id: post.id },
            },
        });

        return response;
    }

    public async getPostLikeCount(postId: string): Promise<number> {
        const postLikeCount = await this.postLikeRepo.count({
            where: { post: { id: postId } },
        });
        return postLikeCount;
    }
}
