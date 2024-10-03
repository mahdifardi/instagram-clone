import { UserService } from "../../src/modules/userHandler/user/user.service";
import { BadRequestError, NotFoundError } from "../../src/utility/http-errors";
import { createTestDb } from "../../src/utility/test-db";
import { ServiceFactory } from "../../src/utility/service-factory";
import { UserRelationService } from "../../src/modules/userHandler/userRelation/userRelation.service";
import { NotificationService } from "../../src/modules/userHandler/notification/notification.service";

describe("User relation service test suite", () => {
    let serviceFactory: ServiceFactory;
    let userService: UserService;
    let userRelationService: UserRelationService;
    let notificationService: NotificationService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        userService = serviceFactory.getUserService();
        userRelationService = serviceFactory.getUserRelationService();
        notificationService = serviceFactory.getNotificationService();

        await userService.createUser({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });

        await userService.createUser({
            username: "follow_test",
            email: "follow_test@gmail.com",
            password: "follow_test",
        });
    });

    describe("Follow public user", () => {
        it("should follow a user", async () => {
            const user = await userService.getUserByUsername("test");
            const response = await userRelationService.follow(
                user!,
                "follow_test"
            );
            const follower = await userService.getUserByUsername("test");
            const following = await userService.getUserByUsername(
                "follow_test"
            );
            expect(response.message).toBe("User followed");
        });

        it("should fail to follow a user if user is already followed", async () => {
            await userRelationService.follow(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            expect(
                userRelationService.follow(
                    (await userService.getUserByUsername("test"))!,
                    "follow_test"
                )
            ).rejects.toThrow(new BadRequestError());
        });

        it("should fail to follow someone that does not exist", async () => {
            expect(
                userRelationService.follow(
                    (await userService.getUserByUsername("test"))!,
                    "wrong_test"
                )
            ).rejects.toThrow(new NotFoundError());
        });
    });

    describe("Unfollow", () => {
        it("should unfollow a user", async () => {
            await userRelationService.follow(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            const user = await userService.getUserByUsername("test");
            const response = await userRelationService.unfollow(
                user!,
                "follow_test"
            );
            const follower = await userService.getUserByUsername("test");
            const following = await userService.getUserByUsername(
                "follow_test"
            );
            expect(response.message).toBe("User unfollowed");
        });

        it("should fail to unfollow a user if user is already not followed", async () => {
            expect(
                userRelationService.unfollow(
                    (await userService.getUserByUsername("test"))!,
                    "follow_test"
                )
            ).rejects.toThrow(new BadRequestError());
        });

        it("should fail to unfollow someone that does not exist", async () => {
            expect(
                userRelationService.unfollow(
                    (await userService.getUserByUsername("test"))!,
                    "wrong_test"
                )
            ).rejects.toThrow(new NotFoundError());
        });
    });

    describe("Follow request", () => {
        it("should send a follow request to a private account", async () => {
            const user = await userService.getUserByUsername("test");
            const privateUser = await userService.getUserByUsername(
                "follow_test"
            );

            await userService.editProfile(
                privateUser!,
                "",
                {
                    email: "follow_test@gmail.com",
                    firstname: "",
                    lastname: "",
                    profileStatus: "private",
                    bio: "",
                    password: "",
                },
                "http://localhost:3000"
            );

            const response = await userRelationService.follow(
                user!,
                "follow_test"
            );

            expect(response.message).toBe("Follow request sent");
        });

        it("should rescind a follow request to a private account", async () => {
            const user = await userService.getUserByUsername("test");
            const privateUser = await userService.getUserByUsername(
                "follow_test"
            );

            await userService.editProfile(
                privateUser!,
                "",
                {
                    email: "follow_test@gmail.com",
                    firstname: "",
                    lastname: "",
                    profileStatus: "private",
                    bio: "",
                    password: "",
                },
                "http://localhost:3000"
            );

            const response = await userRelationService.follow(
                user!,
                "follow_test"
            );

            const response_rescinded = await userRelationService.unfollow(
                user!,
                "follow_test"
            );

            expect(response.message).toBe("Follow request sent");
            expect(response_rescinded.message).toBe("Follow request rescinded");
        });

        it("should accept a follow request", async () => {
            const user = await userService.getUserByUsername("test");
            const privateUser = await userService.getUserByUsername(
                "follow_test"
            );

            await userService.editProfile(
                privateUser!,
                "",
                {
                    email: "follow_test@gmail.com",
                    firstname: "",
                    lastname: "",
                    profileStatus: "private",
                    bio: "",
                    password: "",
                },
                "http://localhost:3000"
            );
            await userRelationService.follow(user!, "follow_test");

            const response = await userRelationService.acceptFollowRequest(
                privateUser!,
                "test"
            );

            expect(response.message).toBe("Follow request accepted");
            const followStatus = await userRelationService.getFollowStatus(
                user!,
                "follow_test"
            );
            expect(followStatus).toBe("request accepted");
        });

        it("should reject a follow request", async () => {
            const user = await userService.getUserByUsername("test");
            const privateUser = await userService.getUserByUsername(
                "follow_test"
            );

            await userService.editProfile(
                privateUser!,
                "",
                {
                    email: "follow_test@gmail.com",
                    firstname: "",
                    lastname: "",
                    profileStatus: "private",
                    bio: "",
                    password: "",
                },
                "http://localhost:3000"
            );

            await userRelationService.follow(user!, "follow_test");

            const response = await userRelationService.rejectFollowRequest(
                privateUser!,
                "test"
            );

            expect(response.message).toBe("Follow request rejected");
            const followStatus = await userRelationService.getFollowStatus(
                user!,
                "follow_test"
            );
            expect(followStatus).toBe("request rejected");
        });

        it("should fail to accept a follow request if not pending", async () => {
            const user = await userService.getUserByUsername("test");
            const publicUser = await userService.getUserByUsername(
                "follow_test"
            );

            await userRelationService.follow(user!, "follow_test");

            await expect(
                userRelationService.acceptFollowRequest(
                    publicUser!,
                    user!.username
                )
            ).rejects.toThrow(BadRequestError);
        });

        it("should fail to reject a follow request if not pending", async () => {
            const user = await userService.getUserByUsername("test");
            const publicUser = await userService.getUserByUsername(
                "follow_test"
            );

            await userRelationService.follow(user!, "follow_test");

            await expect(
                userRelationService.rejectFollowRequest(
                    publicUser!,
                    user!.username
                )
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe("Follower and Following Lists", () => {
        it("should get follower list", async () => {
            const user = await userService.getUserByUsername("test");
            await userRelationService.follow(user!, "follow_test");

            const followers = await userRelationService.followerList(
                user,
                "follow_test",
                1,
                10,
                "http://localhost:3000"
            );

            expect(followers?.data.length).toBeGreaterThan(0);
        });

        it("should get following list", async () => {
            const user = await userService.getUserByUsername("test");
            await userRelationService.follow(user!, "follow_test");

            const follower = await userService.getUserByUsername("follow_test");

            const followings = await userRelationService.followeingList(
                follower,
                "test",
                1,
                10,
                "http://localhost:3000"
            );

            expect(followings?.data.length).toBeGreaterThan(0);
        });

        it("should fail to get follower list if user does not exist", async () => {
            const user = await userService.getUserByUsername("test");

            await expect(
                userRelationService.followerList(
                    user,
                    "non_existent_user",
                    1,
                    10,
                    "http://localhost:3000"
                )
            ).rejects.toThrow(NotFoundError);
        });

        it("should fail to get following list if user does not exist", async () => {
            const user = await userService.getUserByUsername("test");

            await expect(
                userRelationService.followeingList(
                    user,
                    "non_existent_user",
                    1,
                    10,
                    "http://localhost:3000"
                )
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe("Delete follower", () => {
        it("should delete a follower", async () => {
            await userRelationService.follow(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            const user = await userService.getUserByUsername("follow_test");
            const response = await userRelationService.deleteFollower(
                user!,
                "test"
            );
            const follower = await userService.getUserByUsername("test");
            const following = await userService.getUserByUsername(
                "follow_test"
            );
            expect(response.message).toBe("Follower deleted");
        });

        it("should fail to delete a follower if not followed by", async () => {
            expect(
                userRelationService.deleteFollower(
                    (await userService.getUserByUsername("test"))!,
                    "follow_test"
                )
            ).rejects.toThrow(new BadRequestError());
        });

        it("should fail to unfollow someone that does not exist", async () => {
            expect(
                userRelationService.deleteFollower(
                    (await userService.getUserByUsername("test"))!,
                    "wrong_test"
                )
            ).rejects.toThrow(new NotFoundError());
        });
    });

    describe("Block and unblock", () => {
        it("should block a user", async () => {
            const response = await userRelationService.block(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            expect(response.message).toBe("User blocked");
        });

        it("should fail to follow someone if blocked", async () => {
            await userRelationService.block(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            expect(
                userRelationService.follow(
                    (await userService.getUserByUsername("follow_test"))!,
                    "test"
                )
            ).rejects.toThrow(new BadRequestError());
        });

        it("should fail to block someone that does not exist", async () => {
            expect(
                userRelationService.block(
                    (await userService.getUserByUsername("test"))!,
                    "wrong_test"
                )
            ).rejects.toThrow(new NotFoundError());
        });

        it("should unblock a user", async () => {
            await userRelationService.block(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            const response = await userRelationService.unblock(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            expect(response.message).toBe("User unblocked");
        });

        it("should follow someone if unblocked", async () => {
            await userRelationService.block(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            await userRelationService.unblock(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            const response = await userRelationService.follow(
                (await userService.getUserByUsername("follow_test"))!,
                "test"
            );
            expect(response.message).toBe("User followed");
        });
    });

    describe("Close friends", () => {
        it("should add user to close friends", async () => {
            await userRelationService.follow(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );

            const response = await userRelationService.addCloseFriend(
                (await userService.getUserByUsername("follow_test"))!,
                "test"
            );
            expect(response.message).toBe("User added to close friends");
        });

        it("should fail to add to close friends if not followed", async () => {
            expect(
                userRelationService.addCloseFriend(
                    (await userService.getUserByUsername("follow_test"))!,
                    "test"
                )
            ).rejects.toThrow(new BadRequestError());
        });

        it("should remove a user from close friends", async () => {
            await userRelationService.follow(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );

            await userRelationService.addCloseFriend(
                (await userService.getUserByUsername("follow_test"))!,
                "test"
            );

            const response = await userRelationService.removeCloseFriend(
                (await userService.getUserByUsername("follow_test"))!,
                "test"
            );
            expect(response.message).toBe("User removed from close friends");
        });
    });
});
