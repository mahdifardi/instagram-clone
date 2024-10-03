import e from "express";
import { NotFoundError } from "../../utility/http-errors";
import {
    Post,
    PostWithUsername,
    toPostPage,
} from "../postHandler/post/model/post.model";
import { PostHandler } from "../postHandler/postHandler";
import { NotificationService } from "./notification/notification.service";
import { SavedPostService } from "./savedPost/savedPost.service";
import { ThreadService } from "./thread/thread.service";
import { EditProfileDto } from "./user/dto/edit-profile.dto";
import { LoginDto } from "./user/dto/login.dto";
import { SignUpDto } from "./user/dto/signup.dto";
import {
    toProfileInfo,
    User,
    userSearchResponse,
    userSearchUser,
    UserWithoutPassword,
} from "./user/model/user.model";
import { UserService } from "./user/user.service";
import {
    followerFollowingListUserResponse,
    toProfile,
    toProfileFollowStatus,
} from "./userRelation/model/userRelation.model";
import { UserRelationService } from "./userRelation/userRelation.service";
import { MessageService } from "./message/message.service";

// help

export class UserHandler {
    constructor(
        private userService: UserService,
        private userRelationService: UserRelationService,
        private savedService: SavedPostService,
        private notificationService: NotificationService,
        private postHandler: PostHandler,
        private threadService: ThreadService,
        private messageService: MessageService
    ) {}

    public async createUser(dto: SignUpDto): Promise<UserWithoutPassword> {
        return this.userService.createUser(dto);
    }

    public async login(dto: LoginDto, baseUrl: string) {
        return this.userService.login(dto, baseUrl);
    }

    public async forgetPassword(credential: string) {
        return this.userService.forgetPassword(credential);
    }

    public async resetPassword(newPass: string, token: string) {
        return this.userService.resetPassword(newPass, token);
    }

    public getEditProfile(user: User, baseUrl: string) {
        return this.userService.getEditProfile(user, baseUrl);
    }

    public async editProfile(
        user: User,
        pictureFilename: string,
        dto: EditProfileDto,
        baseUrl: string
    ) {
        return this.userService.editProfile(
            user,
            pictureFilename,
            dto,
            baseUrl
        );
    }
    public async getProfileInfo(user: User, baseUrl: string) {
        const unreadUserNotifications =
            await this.notificationService.getAllUserUnreadNotifications(user);

        const unreadUserFollowingNotifications =
            await this.notificationService.getAllUserFollowingsUnreadNotifications(
                user
            );

        const posts = await this.getUserPosts(user, user.username, baseUrl);
        const unreadMessages =
            await this.threadService.getUserUnreadMessagesCount(user);
        return toProfileInfo(
            user,
            posts,
            baseUrl,
            unreadUserNotifications,
            unreadUserFollowingNotifications,
            unreadMessages
        );
    }

    public async getUserPosts(session_user: User, username: string, baseUrl: string) {
        const user = await this.userService.getUserByUsername(username);
        const posts = await this.userService.getUserPosts(username, baseUrl);
        const profilePosts: PostWithUsername[] = [];
        for (const post of posts) {
            const like_status = await this.postHandler.getPostLikeStatus(
                session_user,
                post.id
            );
            const save_status = await this.postHandler.getPostSaveStatus(
                session_user,
                post.id
            );

            profilePosts.push(
                toPostPage(
                    user,
                    post,
                    baseUrl,
                    like_status,
                    save_status,
                )
            );
        }
        return profilePosts;
    }

    public async followHandler(user: User, following_username: string) {
        const followStatus = await this.userRelationService.getFollowStatus(
            user,
            following_username
        );

        if (
            followStatus == "unfollowed" ||
            followStatus == "not followed" ||
            followStatus == "request rejected" ||
            followStatus == "request rescinded" ||
            followStatus == "follower deleted" ||
            followStatus == "unblocked"
        ) {
            return this.follow(user, following_username);
        } else {
            return this.unfollow(user, following_username);
        }
    }

    public async follow(user: User, following_username: string) {
        return this.userRelationService.follow(user, following_username);
    }

    public async unfollow(user: User, following_username: string) {
        return this.userRelationService.unfollow(user, following_username);
    }

    public async acceptFollowRequest(user: User, follower_username: string) {
        return this.userRelationService.acceptFollowRequest(
            user,
            follower_username
        );
    }

    public async rejectFollowRequest(user: User, follower_username: string) {
        return this.userRelationService.rejectFollowRequest(
            user,
            follower_username
        );
    }

    public async userProfile(
        session_user: User,
        username: string,
        baseUrl: string
    ) {
        const user = await this.userService.getUserByUsername(username);
        const followStatus = await this.getFollowStatus(session_user, username);
        const reverse_followStatus = await this.getFollowStatus(
            user,
            session_user.username
        );
        const profileFollowStatus = toProfileFollowStatus(
            followStatus,
            reverse_followStatus
        );

        if (
            profileFollowStatus.followStatus === "blocked" ||
            profileFollowStatus.reverseFollowStatus === "blocked" ||
            (user.profileStatus === "private" &&
                profileFollowStatus.followStatus !== "followed")
        ) {
            return toProfile(
                user,
                profileFollowStatus,
                [],
                baseUrl,
            );
        }

        const posts = await this.getUserPosts(session_user, username, baseUrl);
        const normalPosts = posts.filter(
            (post) => post.close_status === "normal"
        );

        if (followStatus === "followed") {
            return toProfile(
                user,
                profileFollowStatus,
                normalPosts,
                baseUrl,
            );
        } else if (followStatus === "close") {
            return toProfile(
                user,
                profileFollowStatus,
                posts,
                baseUrl,
            );
        }
        return toProfile(
            user,
            profileFollowStatus,
            normalPosts,
            baseUrl,
        );
    }

    public async followerList(
        session_user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        return this.userRelationService.followerList(
            session_user,
            username,
            page,
            limit,
            baseUrl
        );
    }

    public async followeingList(
        session_user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        return this.userRelationService.followeingList(
            session_user,
            username,
            page,
            limit,
            baseUrl
        );
    }

    public async allFollowingList(username: string) {
        return this.userRelationService.allFolloweingList(username);
    }

    public async savePostHandler(user: User, postId: string) {
        const savedStatus = await this.savedService.getPostSaveStatus(
            user,
            postId
        );
        if (savedStatus) {
            return this.unSavePost(user, postId);
        } else {
            return this.savePost(user, postId);
        }
    }

    public async savePost(user: User, postId: string) {
        return this.savedService.savePost(user, postId);
    }

    public async unSavePost(user: User, postId: string) {
        return this.savedService.unSavePost(user, postId);
    }

    public async getUserByUsername(username: string) {
        return this.userService.getUserByUsername(username);
    }

    public async deleteFollower(user: User, follower_username: string) {
        return this.userRelationService.deleteFollower(user, follower_username);
    }

    public async blockHandler(user: User, following_username: string) {
        const followStatus = await this.userRelationService.getFollowStatus(
            user,
            following_username
        );

        if (followStatus == "blocked") {
            return this.unblock(user, following_username);
        } else {
            return this.block(user, following_username);
        }
    }

    public async block(user: User, following_username: string) {
        return this.userRelationService.block(user, following_username);
    }

    public async unblock(user: User, following_username: string) {
        return this.userRelationService.unblock(user, following_username);
    }

    public async getUserNotifications(
        user: User,
        baseUrl: string,
        page: number,
        limit: number
    ) {
        return await this.notificationService.getUserNotifications(
            user,
            baseUrl,
            page,
            limit
        );
    }

    public async getUserFollowingsNotifications(
        user: User,
        baseUrl: string,
        page: number,
        limit: number
    ) {
        return await this.notificationService.getUserFollowingsNotifications(
            user,
            baseUrl,
            page,
            limit
        );
    }

    public async addCloseFriendHandler(user: User, follower_username: string) {
        const follower = await this.userService.getUserByUsername(
            follower_username
        );
        if (!follower) {
            throw new NotFoundError();
        }
        const followStatus = await this.userRelationService.getFollowStatus(
            follower,
            user.username
        );
        if (followStatus == "close") {
            return this.removeCloseFriend(user, follower_username);
        } else {
            return this.addCloseFriend(user, follower_username);
        }
    }

    public async addCloseFriend(user: User, follower_username: string) {
        return this.userRelationService.addCloseFriend(user, follower_username);
    }

    public async removeCloseFriend(user: User, follower_username: string) {
        return this.userRelationService.removeCloseFriend(
            user,
            follower_username
        );
    }

    public async closeFriendList(
        session_user: User,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        return this.userRelationService.closeFriendList(
            session_user,
            page,
            limit,
            baseUrl
        );
    }

    public async blockList(
        session_user: User,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        return this.userRelationService.blockList(
            session_user,
            page,
            limit,
            baseUrl
        );
    }

    public async explore(
        user: User,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const followings = await this.userRelationService.allFolloweingList(
            user.username
        );
        const allPosts = await this.postHandler.getExplorePosts(
            followings,
            page,
            limit
        );

        const shownPosts = [];
        for (const post of allPosts.data) {
            if (post.close_status === "close") {
                const follow_status =
                    await this.userRelationService.getFollowStatus(
                        user,
                        post.user.username
                    );
                if (follow_status === "close") {
                    const shownPost = await this.toShownPost(
                        user,
                        post,
                        baseUrl
                    );
                    shownPosts.push(shownPost);
                }
            } else {
                const shownPost = await this.toShownPost(user, post, baseUrl);
                shownPosts.push(shownPost);
            }
        }

        const response = {
            data: shownPosts,
            meta: {
                page: page,
                limit: limit,
                total: shownPosts.length,
                totalPage: Math.ceil(shownPosts.length / limit),
            },
        };

        return response;
    }

    async getFollowStatus(user: User, following_username: string) {
        return this.userRelationService.getFollowStatus(
            user,
            following_username
        );
    }

    public async getMentionedPosts(
        user: User,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const mentionedPosts = await this.postHandler.getMentionedPosts(
            user.username,
            page,
            limit
        );

        const shownPosts = [];
        for (const post of mentionedPosts.data) {
            const shownPost = await this.toShownPost(user, post, baseUrl);
            shownPosts.push(shownPost);
        }

        const response = {
            data: shownPosts,
            meta: {
                page: page,
                limit: limit,
                total: shownPosts.length,
                totalPage: Math.ceil(shownPosts.length / limit),
            },
        };

        return response;
    }

    public async getSavedPosts(
        user: User,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const savedPosts = await this.savedService.getSavedPosts(
            user.username,
            page,
            limit
        );

        const shownPosts = [];
        for (const post of savedPosts.data) {
            const follow_status =
                await this.userRelationService.getFollowStatus(
                    user,
                    post.user.username
                );
            const reverse_follow_status =
                await this.userRelationService.getFollowStatus(
                    post.user,
                    user.username
                );
            if (
                follow_status === "blocked" ||
                reverse_follow_status === "blocked"
            ) {
                continue;
            } else if (post.user.profileStatus === "private") {
                if (follow_status === "followed" || follow_status === "close") {
                    if (
                        post.close_status === "close" &&
                        follow_status === "followed"
                    ) {
                        continue;
                    } else {
                        const shownPost = await this.toShownPost(
                            user,
                            post,
                            baseUrl
                        );
                        shownPosts.push(shownPost);
                    }
                }
            } else {
                const shownPost = await this.toShownPost(user, post, baseUrl);
                shownPosts.push(shownPost);
            }
        }

        const response = {
            data: shownPosts,
            meta: {
                page: page,
                limit: limit,
                total: shownPosts.length,
                totalPage: Math.ceil(shownPosts.length / limit),
            },
        };

        return response;
    }

    public async getUserSearchSuggestion(
        user: User,
        query: string,
        baseUrl: string,
        limit: number
    ) {
        return await this.userService.getUserSearchSuggestion(
            user,
            query,
            baseUrl,
            limit
        );
    }

    public async userSearch(
        user: User,
        query: string,
        baseUrl: string,
        page: number,
        limit: number
    ): Promise<userSearchResponse> {
        const { data, total } = await this.userService.userSearch(
            user,
            query,
            page,
            limit
        );

        let userSearchUserList: userSearchUser[] = [];

        for (const userSearch of data) {
            const followStatus = await this.userRelationService.getFollowStatus(
                user,
                userSearch.username
            );
            const reverse_followStatus =
                await this.userRelationService.getFollowStatus(
                    userSearch,
                    user.username
                );

            const profileFollowStatus = toProfileFollowStatus(
                followStatus,
                reverse_followStatus
            );

            const searchUser: userSearchUser = {
                username: userSearch.username,
                firstname: userSearch.firstname,
                lastname: userSearch.lastname,
                followStatus: profileFollowStatus.followStatus,
                reverseFollowStatus: profileFollowStatus.reverseFollowStatus,
                profileStatus: userSearch.profileStatus,
                profilePicture: userSearch.profilePicture
                    ? `${baseUrl}/api/images/profiles/${userSearch.profilePicture}`
                    : "",
                follower_count: userSearch.follower_count,
            };
            userSearchUserList.push(searchUser);
        }

        userSearchUserList.sort((a, b) => b.follower_count - a.follower_count);

        return {
            data: userSearchUserList,
            meta: {
                page: page,
                limit: limit,
                total: total,
                totalPage: Math.ceil(total / limit),
            },
        };
    }

    public async getUserThreads(
        user: User,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        return await this.threadService.getUserThreads(
            user,
            page,
            limit,
            baseUrl
        );
    }

    public async getThread(user: User, username: string) {
        return await this.threadService.getThread(user, username);
    }

    public async getThreadHistory(
        threadId: string,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        return await this.threadService.getThreadHistory(
            threadId,
            page,
            limit,
            baseUrl
        );
    }

    public async newMessage(
        sender: User,
        threadId: string,
        base_url: string,
        text?: string,
        image?: string
    ) {
        const thread = await this.threadService.getThreadById(threadId);
        return await this.messageService.newMessage(
            sender,
            thread,
            base_url,
            text,
            image
        );
    }

    public async getPostSearchSuggestion(
        user: User,
        query: string,
        limit: number
    ) {
        return await this.postHandler.getPostSearchSuggestion(
            user,
            query,
            limit
        );
    }

    public async postSearch(
        user: User,
        query: string,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const posts = await this.postHandler.postSearch(
            user,
            query,
            page,
            limit
        );

        const shownPosts = [];
        for (const post of posts.data) {
            const follow_status =
                await this.userRelationService.getFollowStatus(
                    user,
                    post.user.username
                );
            const reverse_follow_status =
                await this.userRelationService.getFollowStatus(
                    post.user,
                    user.username
                );
            if (
                follow_status === "blocked" ||
                reverse_follow_status === "blocked"
            ) {
                continue;
            } else if (post.user.profileStatus === "private") {
                if (follow_status === "followed" || follow_status === "close") {
                    if (
                        post.close_status === "close" &&
                        follow_status === "followed"
                    ) {
                        continue;
                    } else {
                        const shownPost = await this.toShownPost(
                            user,
                            post,
                            baseUrl
                        );
                        shownPosts.push(shownPost);
                    }
                }
            } else {
                const shownPost = await this.toShownPost(user, post, baseUrl);
                shownPosts.push(shownPost);
            }
        }

        const response = {
            data: shownPosts,
            meta: {
                page: page,
                limit: limit,
                total: shownPosts.length,
                totalPage: Math.ceil(shownPosts.length / limit),
            },
        };

        return response;
    }

    public async suggestionHandler(
        user: User,
        userQuery: string,
        postQuery: string,
        limit: number,
        baseUrl: string
    ) {
        if (userQuery) {
            return await this.getUserSearchSuggestion(
                user,
                userQuery,
                baseUrl,
                limit
            );
        } else if (postQuery) {
            return await this.getPostSearchSuggestion(user, postQuery, limit);
        }
    }

    public async searchHandler(
        user: User,
        userQuery: string,
        postQuery: string,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        if (userQuery) {
            return await this.userSearch(user, userQuery, baseUrl, page, limit);
        } else if (postQuery) {
            return await this.postSearch(user, postQuery, page, limit, baseUrl);
        }
    }

    private async toShownPost(user: User, post: Post, baseUrl: string) {
        const like_status = await this.postHandler.getPostLikeStatus(
            user,
            post.id
        );
        const save_status = await this.postHandler.getPostSaveStatus(
            user,
            post.id
        );

        return toPostPage(
            post.user,
            post,
            baseUrl,
            like_status,
            save_status,
        );
    }

    public async deleteMessage(messageId: string) {
        await this.messageService.deleteMessage(messageId);
    }
}
