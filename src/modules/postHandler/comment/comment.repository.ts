import { DataSource, IsNull, Repository } from "typeorm";
import { CommentEntity } from "./entity/comment.entity";
import { Comment, CommentsList, CreateComment } from "./model/comment.model";
import { PostEntity } from "../post/entity/post.entity";

export class CommentRepository {
    private commentRepo: Repository<CommentEntity>;

    constructor(private appDataSource: DataSource) {
        this.commentRepo = appDataSource.getRepository(CommentEntity);
    }

    public async create(comment: CreateComment): Promise<Comment> {
        return await this.commentRepo.save(comment);
    }

    public async findById(id: string): Promise<Comment | null> {
        return await this.commentRepo.findOne({ where: { id } });
    }

    public async getComments(
        postId: string,
        page: number,
        limit: number
    ): Promise<CommentsList> {
        const [response, total] = await this.commentRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: { post: { id: postId }, parent: IsNull() },
            relations: ["children", "user"],
        });

        await Promise.all(
            response.map(async (comment) => {
                comment.children = await this.getChildren(comment.id);
            })
        );

        return { data: response, total: total };
    }

    public async getChildren(parentId: string): Promise<Comment[]> {
        const children = await this.commentRepo.find({
            where: { parent: { id: parentId } },
            relations: ["children", "user"],
        });
        for (const child of children) {
            child.children = await this.getChildren(child.id);
        }
        return children;
    }

    public async getCommentCount(postId: string): Promise<number> {
        const commentCount = await this.commentRepo.count({
            where: { post: { id: postId } },
        });
        return commentCount;
    }

    public async setLikeCount(
        commentId: string,
        like_count: number
    ): Promise<void> {
        await this.commentRepo.update({ id: commentId }, { like_count });
    }
}
