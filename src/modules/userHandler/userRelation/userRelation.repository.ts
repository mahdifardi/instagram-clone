import { DataSource, In, Repository } from "typeorm";
import { UserRelationEntity } from "./entity/userRelation.entity";
import { followerFollowing, UserRelation } from "./model/userRelation.model";
import { User } from "../user/model/user.model";

export class UserRelationRepository {
    private userRelationRepo: Repository<UserRelationEntity>;

    constructor(private appDataSource: DataSource) {
        this.userRelationRepo = appDataSource.getRepository(UserRelationEntity);
    }

    public async createFollow(relation: UserRelation): Promise<void> {
        await this.deleteLastRelation(relation);
        await this.userRelationRepo.save(relation);
    }

    public async deleteFollow(userRelation: UserRelation): Promise<void> {
        await this.deleteLastRelation(userRelation);
        await this.userRelationRepo.save(userRelation);
    }

    public async createFollowRequest(
        userRelation: UserRelation
    ): Promise<void> {
        await this.deleteLastRelation(userRelation);
        await this.userRelationRepo.save(userRelation);
    }

    public async deleteFollowRequest(
        userRelation: UserRelation
    ): Promise<void> {
        await this.deleteLastRelation(userRelation);
        await this.userRelationRepo.save(userRelation);
    }

    public async createFollowAccepted(
        userRelation: UserRelation
    ): Promise<void> {
        await this.deleteFollowRequest(userRelation);
        await this.createFollow(userRelation);
    }

    public async createFollowRejected(relation: UserRelation): Promise<void> {
        await this.deleteFollowRequest(relation);
        await this.userRelationRepo.save(relation);
    }

    public async createBlocked(userRelation: UserRelation): Promise<void> {
        await this.deleteLastRelation(userRelation);
        await this.userRelationRepo.save(userRelation);
    }

    public async createUnBlocked(userRelation: UserRelation): Promise<void> {
        await this.deleteLastRelation(userRelation);
        await this.userRelationRepo.save(userRelation);
    }

    public async createCloseFriend(userRelation: UserRelation): Promise<void> {
        await this.deleteLastRelation(userRelation);
        await this.userRelationRepo.save(userRelation);
    }

    public async deleteCloseFriend(userRelation: UserRelation): Promise<void> {
        await this.deleteLastRelation(userRelation);
        await this.userRelationRepo.save(userRelation);
    }

    public async deleteLastRelation(userRelation: UserRelation) {
        await this.userRelationRepo.softDelete({
            follower: userRelation.follower,
            following: userRelation.following,
        });
    }

    public async deleteLastReverseRelation(userRelation: UserRelation) {
        await this.userRelationRepo.softDelete({
            follower: userRelation.following,
            following: userRelation.follower,
        });
    }

    public async checkExistance(
        follower: User,
        following: User
    ): Promise<UserRelation | null> {
        const reponse = await this.userRelationRepo.findOne({
            where: {
                follower: { username: follower.username },
                following: { username: following.username },
            },
        });

        return reponse;
    }

    public async getFollowers(
        user: User,
        page: number,
        limit: number
    ): Promise<followerFollowing> {
        const [response, total] = await this.userRelationRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                following: { username: user.username },
                followStatus: In(["followed", "request accepted", "close"]),
            },
            relations: ["follower"],
        });

        return { data: response.map((res) => res.follower), total: total };
    }

    public async getFollowings(
        user: User,
        page: number,
        limit: number
    ): Promise<followerFollowing> {
        const [response, total] = await this.userRelationRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                follower: { username: user.username },
                followStatus: In(["followed", "request accepted", "close"]),
            },
            relations: ["following"],
        });

        return { data: response.map((res) => res.following), total: total };
    }

    public async getCloseFriends(
        user: User,
        page: number,
        limit: number
    ): Promise<followerFollowing> {
        const [response, total] = await this.userRelationRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                following: { username: user.username },
                followStatus: "close",
            },
            relations: ["follower"],
        });

        return { data: response.map((res) => res.follower), total: total };
    }

    public async getBlockList(
        user: User,
        page: number,
        limit: number
    ): Promise<followerFollowing> {
        const [response, total] = await this.userRelationRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                follower: { username: user.username },
                followStatus: "blocked",
            },
            relations: ["following"],
        });

        return { data: response.map((res) => res.following), total: total };
    }
    public async getAllBlockList(user: User): Promise<UserRelationEntity[]> {
        const response = await this.userRelationRepo.find({
            where: {
                follower: { username: user.username },
                followStatus: "blocked",
            },
            relations: ["following"],
        });

        return response;
    }

    public async getAllFollowings(user: User): Promise<UserRelationEntity[]> {
        const [response, total] = await this.userRelationRepo.findAndCount({
            where: {
                follower: { username: user.username },
                followStatus: In(["followed", "close"]),
            },
            relations: ["following"],
        });

        return response;
    }

    public async getAllFollowers(user: User): Promise<UserRelationEntity[]> {
        const [response, total] = await this.userRelationRepo.findAndCount({
            where: { following: { username: user.username } },
            relations: ["follower", "following"],
        });

        return response;
    }

    public async getFollowerCount(username: string): Promise<number> {
        const followerCount = await this.userRelationRepo.count({
            where: {
                following: { username },
                followStatus: In(["followed", "request accepted", "close"]),
            },
        });
        return followerCount;
    }

    public async getFollowingCount(username: string): Promise<number> {
        const followerCount = await this.userRelationRepo.count({
            where: {
                follower: { username },
                followStatus: In(["followed", "request accepted", "close"]),
            },
        });
        return followerCount;
    }
}
