import { DataSource, Like, Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";
import { CreateUser, UpdateProfile, User } from "./model/user.model";
import { Post } from "../../postHandler/post/model/post.model";
import { hashGenerator } from "../../../utility/hash-generator";

export class UserRepository {
    private userRepo: Repository<UserEntity>;

    constructor(appDataSource: DataSource) {
        this.userRepo = appDataSource.getRepository(UserEntity);
    }

    public findByUsername(username: string): Promise<User | null> {
        return this.userRepo.findOne({
            where: { username },
        });
    }

    public findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({
            where: { email },
        });
    }

    public findById(id: string): Promise<User | null> {
        return this.userRepo.findOne({
            where: { id },
        });
    }

    public async hashPassword(password: string): Promise<string> {
        return await hashGenerator(password);
    }

    public async create(user: CreateUser): Promise<User> {
        return this.userRepo.save({
            username: user.username,
            password: await this.hashPassword(user.password),
            email: user.email,
        });
    }

    public async updatePassword(
        username: string,
        password: string
    ): Promise<void> {
        await this.userRepo.update({ username }, { password });
    }

    public async updateProfile(
        user: User,
        profilePicture: string,
        updated: UpdateProfile
    ): Promise<void> {
        const updatedData = {
            password: updated.password
                ? await this.hashPassword(updated.password)
                : user.password,
            email: updated.email,
            profilePicture: profilePicture,
            firstname: updated.firstname,
            lastname: updated.lastname,
            profileStatus: updated.profileStatus,
            bio: updated.bio,
        };
        await this.userRepo.update(
            {
                username: user.username,
            },
            updatedData
        );
    }

    public async getUserPosts(username: string): Promise<Post[]> {
        const userWithPosts = await this.userRepo.findOne({
            where: { username },
            relations: ["posts"],
            order: {
                createdAt: "DESC",
            },
        });

        if (userWithPosts) {
            return userWithPosts.posts.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
        }

        return [];
    }

    public async getUserSearchSuggestion(
        query: string,
        limit: number = 5
    ): Promise<User[] | null> {
        const [response, total] = await this.userRepo.findAndCount({
            take: limit,
            where: [
                { username: Like(`%${query}%`) },
                { firstname: Like(`%${query}%`) },
                { lastname: Like(`%${query}%`) },
            ],
            order: {
                follower_count: "DESC",
            },
        });

        return response;
    }

    public async userSearch(query: string, page: number, limit: number) {
        const [response, total] = await this.userRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: [
                { username: Like(`%${query}%`) },
                { firstname: Like(`%${query}%`) },
                { lastname: Like(`%${query}%`) },
            ],
            order: {
                follower_count: "DESC",
            },
        });

        return { data: response, total: total };
    }

    public async setPostCount(
        username: string,
        post_count: number
    ): Promise<void> {
        await this.userRepo.update({ username }, { post_count });
    }

    public async setFollowerFollowingCount(
        username: string,
        follower_count: number,
        following_count: number
    ): Promise<void> {
        await this.userRepo.update(
            { username },
            { follower_count, following_count }
        );
    }
}
