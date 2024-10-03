import { PostWithUsername } from "../../../postHandler/post/model/post.model";
import { UserEntity } from "../../user/entity/user.entity";
import { User } from "../../user/model/user.model";

export type FollowStatus =
    | "request pending"
    | "followed"
    | "unfollowed"
    | "request accepted"
    | "request rejected"
    | "close"
    | "blocked"
    | "unblocked"
    | "request rescinded"
    | "not followed"
    | "follower deleted";

export interface UserRelation {
    follower: User;
    following: User;
    followStatus: FollowStatus;
}

export interface followerFollowing {
    data: UserEntity[];
    total: number;
}

export type UserProfile = Omit<User, "password" | "email" | "profileStatus"> & {
    followStatus: PFollowStatus;
    reverseFollowStatus: PFollowStatus;
    posts: PostWithUsername[];
    follower_count: number;
    following_count: number;
    post_count: number;
};

export type PFollowStatus =
    | "followed"
    | "requested"
    | "not followed"
    | "blocked"
    | "close friend";

export type ProfileFollowStatus = {
    followStatus: PFollowStatus;
    reverseFollowStatus: PFollowStatus;
};

export const toProfileFollowStatus = (
    follow_status: FollowStatus,
    reverse_followStatus: FollowStatus
): ProfileFollowStatus => {
    let followStatus: PFollowStatus = "not followed";
    let reverseFollowStatus: PFollowStatus = "not followed";
    if (reverse_followStatus === "blocked") {
        reverseFollowStatus = "blocked";
    } else if (
        reverse_followStatus === "not followed" ||
        reverse_followStatus === "unfollowed" ||
        reverse_followStatus === "request rejected" ||
        reverse_followStatus === "request rescinded" ||
        reverse_followStatus === "follower deleted"
    ) {
        reverseFollowStatus = "not followed";
    } else if (
        reverse_followStatus === "followed" ||
        reverse_followStatus === "request accepted"
    ) {
        reverseFollowStatus = "followed";
    } else if (reverse_followStatus === "request pending") {
        reverseFollowStatus = "requested";
    } else if (reverse_followStatus === "close") {
        reverseFollowStatus = "close friend";
    }

    if (follow_status === "blocked") {
        followStatus = "blocked";
    } else if (
        follow_status === "not followed" ||
        follow_status === "unfollowed" ||
        follow_status === "request rejected" ||
        follow_status === "request rescinded" ||
        follow_status === "follower deleted"
    ) {
        followStatus = "not followed";
    } else if (
        follow_status === "followed" ||
        follow_status === "request accepted"
    ) {
        followStatus = "followed";
    } else if (follow_status === "request pending") {
        followStatus = "requested";
    } else if (follow_status === "close") {
        followStatus = "followed";
    }

    return {
        followStatus,
        reverseFollowStatus,
    };
};

export const toProfile = (
    user: User,
    followStatus: ProfileFollowStatus,
    posts: PostWithUsername[],
    baseUrl: string
): UserProfile => {
    const { password, email, profilePicture, ...profileInfo } = user;
    return {
        ...profileInfo,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        posts,
        followStatus: followStatus.followStatus,
        reverseFollowStatus: followStatus.reverseFollowStatus,
        follower_count: user.follower_count,
        following_count: user.following_count,
        post_count: user.post_count,
    };
};

export type UserList = Omit<
    User,
    "password" | "post_count" | "email" | "profileStatus" | "bio"
>;

export type followerFollowingListUser = UserList & {
    followStatus: PFollowStatus;
    reverseFollowStatus: PFollowStatus;
};

export const toFollowerFollowingListUser = (
    user: User,
    baseUrl: string,
    followStatus: ProfileFollowStatus
): followerFollowingListUser => {
    return {
        username: user.username,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        firstname: user.firstname,
        lastname: user.lastname,
        follower_count: user.follower_count,
        following_count: user.following_count,
        followStatus: followStatus.followStatus,
        reverseFollowStatus: followStatus.reverseFollowStatus,
    };
};

export const toUserList = (user: User, baseUrl: string): UserList => {
    return {
        username: user.username,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        firstname: user.firstname,
        lastname: user.lastname,
        follower_count: user.follower_count,
        following_count: user.follower_count
    };
};

export type followerFollowingListUserResponse = {
    data: followerFollowingListUser[];
    meta: {
        total: number;
        page: number;
        totalPage: number;
        limit: number;
    };
};
