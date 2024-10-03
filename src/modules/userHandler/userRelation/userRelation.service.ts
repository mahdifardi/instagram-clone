import { BadRequestError, HttpError } from "../../../utility/http-errors";
import { User } from "../user/model/user.model";
import { UserService } from "../user/user.service";
import { UserRelationEntity } from "./entity/userRelation.entity";
import {
    followerFollowingListUser,
    followerFollowingListUserResponse,
    toFollowerFollowingListUser,
    toProfile,
    toProfileFollowStatus,
    UserRelation,
} from "./model/userRelation.model";
import { UserRelationRepository } from "./userRelation.repository";

export class UserRelationService {
    constructor(
        private userRelationRepo: UserRelationRepository,
        private userService: UserService
    ) {}

    async getFollowStatus(user: User, following_username: string) {
        // if (user.username === following_username) {
        //     throw new HttpError(403, "Can't have a relation with self")
        // }
        const following = await this.userService.getUserByUsername(
            following_username
        );
        const relation = await this.userRelationRepo.checkExistance(
            user,
            following
        );
        const followStatus = relation ? relation.followStatus : "not followed";
        return followStatus;
    }

    public async follow(user: User, following_username: string) {
        const following = await this.userService.getUserByUsername(
            following_username
        );
        const followStatus = await this.getFollowStatus(
            user,
            following.username
        );
        const reverse_followStatus = await this.getFollowStatus(
            following,
            user.username
        );
        if (
            (followStatus !== "unfollowed" &&
                followStatus !== "not followed" &&
                followStatus !== "request rejected" &&
                followStatus !== "request rescinded" &&
                followStatus !== "follower deleted" &&
                followStatus !== "unblocked") ||
            reverse_followStatus === "blocked"
        ) {
            throw new BadRequestError();
        }

        if (following.profileStatus === "public") {
            const relation: UserRelation = {
                follower: user,
                following,
                followStatus: "followed",
            };
            await this.userRelationRepo.createFollow(relation);
            await this.getFollowerFollowingCount(user.username);
            await this.getFollowerFollowingCount(following.username);
            return { message: "User followed" };
        } else {
            const relation: UserRelation = {
                follower: user,
                following,
                followStatus: "request pending",
            };
            await this.userRelationRepo.createFollowRequest(relation);
            return { message: "Follow request sent" };
        }
    }

    public async unfollow(user: User, following_username: string) {
        const following = await this.userService.getUserByUsername(
            following_username
        );
        const followStatus = await this.getFollowStatus(
            user,
            following.username
        );
        if (
            followStatus !== "followed" &&
            followStatus !== "request accepted" &&
            followStatus !== "request pending"
        ) {
            throw new BadRequestError();
        }
        if (
            followStatus === "request accepted" ||
            followStatus === "followed"
        ) {
            const relation: UserRelation = {
                follower: user,
                following,
                followStatus: "unfollowed",
            };
            await this.userRelationRepo.deleteFollow(relation);
            await this.getFollowerFollowingCount(user.username);
            await this.getFollowerFollowingCount(following.username);
            return { message: "User unfollowed" };
        } else {
            const relation: UserRelation = {
                follower: user,
                following,
                followStatus: "request rescinded",
            };
            await this.userRelationRepo.deleteFollowRequest(relation);
            return { message: "Follow request rescinded" };
        }
    }

    public async deleteFollower(user: User, follower_username: string) {
        const follower = await this.userService.getUserByUsername(
            follower_username
        );
        const followStatus = await this.getFollowStatus(
            follower,
            user.username
        );
        if (
            followStatus !== "followed" &&
            followStatus !== "request accepted"
        ) {
            throw new BadRequestError();
        }
        const relation: UserRelation = {
            follower,
            following: user,
            followStatus: "follower deleted",
        };
        await this.userRelationRepo.deleteFollow(relation);
        await this.getFollowerFollowingCount(user.username);
        await this.getFollowerFollowingCount(follower.username);
        return { message: "Follower deleted" };
    }

    public async acceptFollowRequest(user: User, follower_username: string) {
        const follower = await this.userService.getUserByUsername(
            follower_username
        );

        const followStatus = await this.getFollowStatus(
            follower,
            user.username
        );

        if (followStatus !== "request pending") {
            throw new BadRequestError();
        }

        const relation: UserRelation = {
            follower,
            following: user,
            followStatus: "request accepted",
        };
        await this.userRelationRepo.createFollowAccepted(relation);
        await this.getFollowerFollowingCount(user.username);
        await this.getFollowerFollowingCount(follower.username);
        return { message: "Follow request accepted" };
    }

    public async rejectFollowRequest(user: User, follower_username: string) {
        const follower = await this.userService.getUserByUsername(
            follower_username
        );

        const followStatus = await this.getFollowStatus(
            follower,
            user.username
        );

        if (followStatus !== "request pending") {
            throw new BadRequestError();
        }

        const relation: UserRelation = {
            follower,
            following: user,
            followStatus: "request rejected",
        };
        await this.userRelationRepo.createFollowRejected(relation);
        return { message: "Follow request rejected" };
    }

    public async block(user: User, following_username: string) {
        const following = await this.userService.getUserByUsername(
            following_username
        );

        const followStatus = await this.getFollowStatus(
            following,
            user.username
        );

        const relation: UserRelation = {
            follower: user,
            following,
            followStatus: "blocked",
        };
        if (followStatus !== "blocked") {
            await this.userRelationRepo.deleteLastReverseRelation(relation);
        }
        await this.userRelationRepo.createBlocked(relation);
        await this.getFollowerFollowingCount(user.username);
        await this.getFollowerFollowingCount(following.username);
        return { message: "User blocked" };
    }

    public async unblock(user: User, following_username: string) {
        const following = await this.userService.getUserByUsername(
            following_username
        );

        const relation: UserRelation = {
            follower: user,
            following,
            followStatus: "unblocked",
        };
        await this.userRelationRepo.createUnBlocked(relation);
        return { message: "User unblocked" };
    }

    public async addCloseFriend(user: User, follower_username: string) {
        const follower = await this.userService.getUserByUsername(
            follower_username
        );

        const followStatus = await this.getFollowStatus(
            follower,
            user.username
        );
        if (
            followStatus !== "followed" &&
            followStatus !== "request accepted"
        ) {
            throw new BadRequestError();
        }

        const relation: UserRelation = {
            follower,
            following: user,
            followStatus: "close",
        };
        await this.userRelationRepo.createCloseFriend(relation);
        return { message: "User added to close friends" };
    }

    public async removeCloseFriend(user: User, follower_username: string) {
        const follower = await this.userService.getUserByUsername(
            follower_username
        );

        const followStatus = await this.getFollowStatus(
            follower,
            user.username
        );
        if (followStatus !== "close") {
            throw new BadRequestError();
        }

        const relation: UserRelation = {
            follower,
            following: user,
            followStatus: "followed",
        };
        await this.userRelationRepo.deleteCloseFriend(relation);
        return { message: "User removed from close friends" };
    }

    public async allFolloweList(user: User) {
        return await this.userRelationRepo.getAllFollowers(user);
    }

    public async followerList(
        session_user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        const user = await this.userService.getUserByUsername(username);

        const followerList = await this.userRelationRepo.getFollowers(
            user,
            page,
            limit
        );

        const followerListData: followerFollowingListUser[] = [];

        for (const follower of followerList.data) {
            const followStatus = await this.getFollowStatus(
                session_user,
                follower.username
            );
            const reverse_followStatus = await this.getFollowStatus(
                follower,
                session_user.username
            );
            const profileFollowStatus = toProfileFollowStatus(
                followStatus,
                reverse_followStatus
            );

            followerListData.push(
                toFollowerFollowingListUser(
                    follower,
                    baseUrl,
                    profileFollowStatus
                )
            );
        }
        return {
            data: followerListData,
            meta: {
                page: page,
                limit: limit,
                total: followerList.total,
                totalPage: Math.ceil(followerList?.total / limit),
            },
        };
    }

    public async followeingList(
        session_user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        const user = await this.userService.getUserByUsername(username);

        const followingList = await this.userRelationRepo.getFollowings(
            user,
            page,
            limit
        );

        const followingListData: followerFollowingListUser[] = [];

        for (const following of followingList.data) {
            const followStatus = await this.getFollowStatus(
                session_user,
                following.username
            );
            const reverse_followStatus = await this.getFollowStatus(
                following,
                session_user.username
            );
            const profileFollowStatus = toProfileFollowStatus(
                followStatus,
                reverse_followStatus
            );
            followingListData.push(
                toFollowerFollowingListUser(
                    following,
                    baseUrl,
                    profileFollowStatus
                )
            );
        }

        return {
            data: followingListData,
            meta: {
                page: page,
                limit: limit,
                total: followingList.total,
                totalPage: Math.ceil(followingList?.total / limit),
            },
        };
    }

    public async allFolloweingList(username: string) {
        const user = await this.userService.getUserByUsername(username);
        const followingList = await this.userRelationRepo.getAllFollowings(
            user
        );
        return followingList;
    }

    public async closeFriendList(
        session_user: User,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        const closeFriendList = await this.userRelationRepo.getCloseFriends(
            session_user,
            page,
            limit
        );

        const closeListData: followerFollowingListUser[] = [];

        for (const close of closeFriendList.data) {
            const followStatus = await this.getFollowStatus(
                session_user,
                close.username
            );
            const reverse_followStatus = await this.getFollowStatus(
                close,
                session_user.username
            );
            const profileFollowStatus = toProfileFollowStatus(
                followStatus,
                reverse_followStatus
            );
            closeListData.push(
                toFollowerFollowingListUser(close, baseUrl, profileFollowStatus)
            );
        }

        return {
            data: closeListData,
            meta: {
                page: page,
                limit: limit,
                total: closeFriendList.total,
                totalPage: Math.ceil(closeFriendList?.total / limit),
            },
        };
    }

    public async blockList(
        session_user: User,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        const blockList = await this.userRelationRepo.getBlockList(
            session_user,
            page,
            limit
        );

        const blockListData: followerFollowingListUser[] = [];

        for (const block of blockList.data) {
            const followStatus = await this.getFollowStatus(
                session_user,
                block.username
            );
            const reverse_followStatus = await this.getFollowStatus(
                block,
                session_user.username
            );
            const profileFollowStatus = toProfileFollowStatus(
                followStatus,
                reverse_followStatus
            );
            blockListData.push(
                toFollowerFollowingListUser(block, baseUrl, profileFollowStatus)
            );
        }

        return {
            data: blockListData,
            meta: {
                page: page,
                limit: limit,
                total: blockList.total,
                totalPage: Math.ceil(blockList?.total / limit),
            },
        };
    }

    public async getAllBlockList(user: User): Promise<UserRelationEntity[]> {
        return await this.userRelationRepo.getAllBlockList(user);
    }

    private async getFollowerFollowingCount(username: string) {
        const follower_count = await this.userRelationRepo.getFollowerCount(
            username
        );
        const following_count = await this.userRelationRepo.getFollowingCount(
            username
        );
        await this.userService.setFollowerFollowingCount(
            username,
            follower_count,
            following_count
        );
    }
}
