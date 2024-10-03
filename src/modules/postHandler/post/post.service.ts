import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from "../../../utility/http-errors";
import { User } from "../../userHandler/user/model/user.model";
import { PostDto } from "./dto/post.dto";
import {
    CreatePost,
    Post,
    PostWithUsername,
    toPostWithUsername,
    UpdatePost,
} from "./model/post.model";
import { PostRepository } from "./post.repository";
import { UpdatePostDto } from "./dto/updatePost.dto";
import { UserService } from "../../userHandler/user/user.service";
import { UserRelation } from "../../userHandler/userRelation/model/userRelation.model";
import { UserRelationService } from "../../userHandler/userRelation/userRelation.service";
import { PostSearchHistoryService } from "../postSearchHistory/postSearchHistory.service";

export class PostService {
    constructor(
        private postRepo: PostRepository,
        private userService: UserService,
        private userRelationService: UserRelationService,
        private postSearchHistoryService: PostSearchHistoryService
    ) {}

    public async createPost(
        user: User,
        postDto: PostDto,
        postImagesFileNames: string[],
        baseUrl: string
    ): Promise<PostWithUsername> {
        await this.checkMentions(postDto.mentions, user);

        const newPost: CreatePost = {
            user: user,
            images: postImagesFileNames,
            caption: postDto.caption,
            tags: this.extractTags(postDto.caption),
            mentions: postDto.mentions,
            close_status: postDto.close_status,
        };

        const createdPost = await this.postRepo.create(newPost);
        await this.getPostCount(user.username);
        return toPostWithUsername(user, createdPost, baseUrl);
    }

    private async checkMentions(mentions: string[], user: User): Promise<void> {
        const results = await Promise.all(
            mentions.map(async (mention) => {
                const mentionedUser = await this.userService.getUserByUsername(
                    mention
                );
                if (mentionedUser) {
                    const mentionedUserBlockList =
                        await this.userRelationService.getAllBlockList(
                            mentionedUser
                        );
                    if (
                        mentionedUserBlockList.filter(
                            (mentionedUserBlock) =>
                                mentionedUserBlock.following.username ==
                                user.username
                        ).length != 0
                    ) {
                        return false;
                    }
                    return true;
                }
            })
        );
        if (!results.every((result) => result === true)) {
            throw new NotFoundError();
        }
    }

    private extractTags(caption: string): string[] {
        const tags = caption.match(/#([\p{L}\p{N}_]+)/gu);
        return tags ? tags.map((tag) => tag.slice(1).toLocaleLowerCase()) : [];
    }

    public async updatePost(
        user: User,
        postId: string,
        postDto: UpdatePostDto,
        postImagesFileNames: string[],
        baseUrl: string
    ): Promise<PostWithUsername> {
        const post = await this.getPost(postId);

        if (post.user.username !== user.username) {
            throw new ForbiddenError();
        }

        const deletedImagesFilenames = postDto.deletedImages.map(
            (deletedImageLink) => {
                const deletedImagesFilename = deletedImageLink.match(
                    /[^/]+\.(jpg|jpeg|png|gif)$/i
                );
                if (!deletedImagesFilename) {
                    throw new BadRequestError();
                }
                return deletedImagesFilename[0];
            }
        );
        const postImages = post.images.filter(
            (image) => !deletedImagesFilenames.includes(image)
        );
        postImages.push(...postImagesFileNames);

        await this.checkMentions(postDto.mentions, user);

        const editedPost: UpdatePost = {
            id: postId,
            user: user,
            images: postImages,
            caption: postDto.caption,
            tags: this.extractTags(postDto.caption),
            mentions: postDto.mentions,
            close_status: postDto.close_status,
        };

        const updatedPost = await this.postRepo.update(editedPost);
        return toPostWithUsername(user, updatedPost, baseUrl);
    }

    public async getPost(postId: string): Promise<Post> {
        const post = await this.postRepo.findPostById(postId);
        if (!post) {
            throw new NotFoundError();
        }
        return post;
    }

    public async getExplorePosts(
        followings: UserRelation[],
        page: number,
        limit: number
    ) {
        return await this.postRepo.getExplorePosts(followings, page, limit);
    }

    private async getPostCount(username: string) {
        const count = await this.postRepo.getPostCount(username);
        await this.userService.setPostCount(username, count);
    }

    public async getMentionedPosts(
        username: string,
        page: number,
        limit: number
    ) {
        return await this.postRepo.getMentionedPosts(username, page, limit);
    }

    public async getPostSearchSuggestion(
        user: User,
        query: string,
        limit: number
    ) {
        const queryResponse = await this.postRepo.getPostSearchSuggestion(
            query,
            limit
        );
        if (!queryResponse) {
            return [];
        }
        const tags: string[] = [];
        for (const post of queryResponse) {
            const matchingTags = post.tags.filter((tag: string) =>
                tag.toLowerCase().includes(query.toLowerCase())
            );

            tags.push(...matchingTags);
        }

        const postSearchHistory =
            await this.postSearchHistoryService.getPostSearchHistory(
                user,
                limit
            );

        const history = postSearchHistory
            ? postSearchHistory.map((data) => data.query)
            : [];

        const tagsSet = new Set(tags);
        const uniqueTags = Array.from(tagsSet);
        return { suggest: uniqueTags, history: history };
    }

    public async postSearch(
        user: User,
        query: string,
        page: number,
        limit: number
    ) {
        await this.postSearchHistoryService.createPostSearchHistory(
            user,
            query
        );
        return await this.postRepo.postSearch(query, page, limit);
    }

    public async setLikeCount(postId: string, like_count: number) {
        return await this.postRepo.setLikeCount(postId, like_count);
    }

    public async setSavedCount(postId: string, saved_count: number) {
        return await this.postRepo.setSavedCount(postId, saved_count);
    }

    public async setCommentCount(postId: string, comment_count: number) {
        return await this.postRepo.setCommentCount(postId, comment_count);
    }
}
