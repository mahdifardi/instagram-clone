import { User } from "../userHandler/user/model/user.model";
import { SavedPostService } from "../userHandler/savedPost/savedPost.service";
import { CommentService } from "./comment/comment.service";
import { CommentDto } from "./comment/dto/comment.dto";
import { Comment, toPostCommentList } from "./comment/model/comment.model";
import { CommentLikeService } from "./commentLike/commentLike.service";
import { PostDto } from "./post/dto/post.dto";
import { PostWithUsername, toPostPage } from "./post/model/post.model";
import { PostService } from "./post/post.service";
import { PostLikeService } from "./postLike/postLike.service";
import { UpdatePostDto } from "./post/dto/updatePost.dto";
import { UserRelation } from "../userHandler/userRelation/model/userRelation.model";
import { UserRelationService } from "../userHandler/userRelation/userRelation.service";

export class PostHandler {
    constructor(
        private postService: PostService,
        private savedPostService: SavedPostService,
        private commentService: CommentService,
        private postLikeService: PostLikeService,
        private commentLikeService: CommentLikeService,
        private userRelationService: UserRelationService
    ) {}
    public async createPost(
        user: User,
        postDto: PostDto,
        postImagesFileNames: string[],
        baseUrl: string
    ): Promise<PostWithUsername> {
        return this.postService.createPost(
            user,
            postDto,
            postImagesFileNames,
            baseUrl
        );
    }

    public async updatePost(
        user: User,
        postId: string,
        postDto: UpdatePostDto,
        postImagesFileNames: string[],
        baseUrl: string
    ): Promise<PostWithUsername> {
        return this.postService.updatePost(
            user,
            postId,
            postDto,
            postImagesFileNames,
            baseUrl
        );
    }

    public async getPostByPostId(
        user: User,
        postId: string,
        baseUrl: string
    ): Promise<PostWithUsername> {
        const post = await this.postService.getPost(postId);
        const like_status = await this.getPostLikeStatus(user, post.id);
        const save_status = await this.getPostSaveStatus(user, post.id);

        return toPostPage(
            post.user,
            post,
            baseUrl,
            like_status,
            save_status,
        );
    }

    public async likePostHandler(user: User, postId: string) {
        const postLikeStatus = await this.postLikeService.getLikeStatus(
            user,
            postId
        );
        if (postLikeStatus) {
            return this.unLikePost(user, postId);
        } else {
            return this.likePost(user, postId);
        }
    }

    public likePost(user: User, postId: string) {
        return this.postLikeService.likePost(user, postId);
    }

    public unLikePost(user: User, postId: string) {
        return this.postLikeService.unLikePost(user, postId);
    }

    public createComment(user: User, commentDto: CommentDto) {
        return this.commentService.createComment(user, commentDto);
    }

    public async likeCommentHandler(user: User, commentId: string) {
        const commentLikeStatus = await this.commentLikeService.getLikeStatus(
            user,
            commentId
        );
        if (commentLikeStatus) {
            return this.unLikeComment(user, commentId);
        } else {
            return this.likeComment(user, commentId);
        }
    }

    public likeComment(user: User, commentId: string) {
        return this.commentLikeService.likeComment(user, commentId);
    }

    public unLikeComment(user: User, commentId: string) {
        return this.commentLikeService.unLikeComment(user, commentId);
    }

    public async commentList(
        user: User,
        postId: string,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const post = await this.postService.getPost(postId);

        const commentList = await this.commentService.getComments(
            postId,
            page,
            limit
        );

        return {
            data: await this.transformComments(user, commentList.data, baseUrl),
            meta: {
                page: page,
                limit: limit,
                total: commentList.total,
                totalPage: Math.ceil(commentList?.total / limit),
            },
        };
    }

    private async transformComments(
        user: User,
        comments: Comment[],
        baseUrl: string
    ): Promise<any[]> {
        return Promise.all(
            comments.map(async (comment) => {
                const likeStatus = await this.commentLikeService.getLikeStatus(
                    user,
                    comment.id
                );

                const transformedComment = toPostCommentList(
                    comment,
                    likeStatus,
                    baseUrl,
                );

                if (comment.children && comment.children.length > 0) {
                    transformedComment.children = await this.transformComments(
                        user,
                        comment.children,
                        baseUrl
                    );
                }

                return transformedComment;
            })
        );
    }

    public async getPostSaveStatus(user: User, commentId: string) {
        return this.savedPostService.getPostSaveStatus(user, commentId);
    }

    public async getPostLikeStatus(user: User, postId: string) {
        return this.postLikeService.getLikeStatus(user, postId);
    }

    public async getExplorePosts(
        followings: UserRelation[],
        page: number,
        limit: number
    ) {
        return await this.postService.getExplorePosts(followings, page, limit);
    }

    public async getMentionedPosts(
        username: string,
        page: number,
        limit: number
    ) {
        return await this.postService.getMentionedPosts(username, page, limit);
    }

    public async getPostSearchSuggestion(
        user: User,
        query: string,
        limit: number
    ) {
        return await this.postService.getPostSearchSuggestion(
            user,
            query,
            limit
        );
    }

    public async postSearch(
        user: User,
        query: string,
        page: number,
        limit: number
    ) {
        return await this.postService.postSearch(user, query, page, limit);
    }
}
