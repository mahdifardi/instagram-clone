import { UserService } from "../../src/modules/userHandler/user/user.service";
import { createTestDb } from "../../src/utility/test-db";
import { ServiceFactory } from "../../src/utility/service-factory";
import { PostService } from "../../src/modules/postHandler/post/post.service";
import { CommentService } from "../../src/modules/postHandler/comment/comment.service";
import { NotificationService } from "../../src/modules/userHandler/notification/notification.service";
import { PostLikeService } from "../../src/modules/postHandler/postLike/postLike.service";
import { UserRelationService } from "../../src/modules/userHandler/userRelation/userRelation.service";

describe("Notification service test suite", () => {
    let serviceFactory: ServiceFactory;
    let userService: UserService;
    let postService: PostService;
    let commentService: CommentService;
    let notificationService: NotificationService;
    let postLikeService: PostLikeService;
    let userRelationService: UserRelationService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        userService = serviceFactory.getUserService();
        postService = serviceFactory.getPostService();
        postLikeService = serviceFactory.getPostLikeService();
        commentService = serviceFactory.getCommentService();
        notificationService = serviceFactory.getNotificationService();
        userRelationService = serviceFactory.getUserRelationService();

        await userService.createUser({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });

        await userService.createUser({
            username: "test2",
            email: "test2@gmail.com",
            password: "test2",
        });

        await userService.createUser({
            username: "test3",
            email: "test3@gmail.com",
            password: "test3",
        });
    });

    describe("post like notifications", () => {
        it("should send a notification when user post is liked", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: [],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const user2 = await userService.getUserByUsername("test2");

            const result = await postLikeService.likePost(user2!, post.id);
            expect(result.message).toEqual("Post liked");

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            const notification = notifications.data[0];
            expect(notification.recipient.username).toEqual(user1!.username);
            expect(notification.sender.username).toEqual(user2!.username);
            expect(notification.type).toEqual("like");
        });

        it("should delete a notification when user post is unliked", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: [],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const user2 = await userService.getUserByUsername("test2");

            await postLikeService.likePost(user2!, post.id);
            const result = await postLikeService.unLikePost(user2!, post.id);
            expect(result.message).toEqual("Post unliked");

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            expect(notifications.data.length).toEqual(0);
        });

        it("should not send a notification when user post is liked by user", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: [],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const result = await postLikeService.likePost(user1!, post.id);
            expect(result.message).toEqual("Post liked");

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            expect(notifications.data.length).toEqual(0);
        });

        it("should send a notification to sender followers when user post is liked", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: [],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const user3 = await userService.getUserByUsername("test3");
            await userRelationService.follow(user3, "test2");

            const user2 = await userService.getUserByUsername("test2");

            const result = await postLikeService.likePost(user2!, post.id);
            expect(result.message).toEqual("Post liked");

            const notifications =
                await notificationService.getUserFollowingsNotifications(
                    user3,
                    "localhost:3000",
                    1,
                    10
                );

            const notification = notifications.data[0];
            expect(notification.recipient.username).toEqual(user2!.username);
            expect(notification.sender.username).toEqual(user1!.username);
            expect(notification.type).toEqual("like");
        });

        it("should delete sender follower notification when user post is unliked", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: [],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const user3 = await userService.getUserByUsername("test3");
            await userRelationService.follow(user3, "test2");

            const user2 = await userService.getUserByUsername("test2");

            await postLikeService.likePost(user2!, post.id);
            const result = await postLikeService.unLikePost(user2!, post.id);
            expect(result.message).toEqual("Post unliked");

            const notifications =
                await notificationService.getUserFollowingsNotifications(
                    user3,
                    "localhost:3000",
                    1,
                    10
                );

            expect(notifications.data.length).toEqual(0);
        });
    });

    describe("comment notifications", () => {
        it("should send a notification when someone comments on user post", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: [],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const user2 = await userService.getUserByUsername("test2");

            const commentDto = {
                postId: post.id,
                text: "Test comment",
                commentId: undefined,
            };

            const result = await commentService.createComment(
                user2!,
                commentDto
            );
            expect(result.text).toEqual("Test comment");

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            const notification = notifications.data[0];
            expect(notification.recipient.username).toEqual(user1!.username);
            expect(notification.sender.username).toEqual(user2!.username);
            expect(notification.type).toEqual("comment");
        });

        it("should not send a notification when user comments on own post", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: [],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const commentDto = {
                postId: post.id,
                text: "Test comment",
                commentId: undefined,
            };

            const result = await commentService.createComment(
                user1!,
                commentDto
            );
            expect(result.text).toEqual("Test comment");

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            expect(notifications.data.length).toEqual(0);
        });

        it("should send a notification to sender followers when user comments on a post", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: [],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const user3 = await userService.getUserByUsername("test3");
            await userRelationService.follow(user3, "test2");

            const user2 = await userService.getUserByUsername("test2");

            const commentDto = {
                postId: post.id,
                text: "Test comment",
                commentId: undefined,
            };

            const result = await commentService.createComment(
                user2!,
                commentDto
            );
            expect(result.text).toEqual("Test comment");

            const notifications =
                await notificationService.getUserFollowingsNotifications(
                    user3,
                    "localhost:3000",
                    1,
                    10
                );

            const notification = notifications.data[0];
            expect(notification.recipient.username).toEqual(user2!.username);
            expect(notification.sender.username).toEqual(user1!.username);
            expect(notification.type).toEqual("comment");
        });
    });

    describe("mention notifications", () => {
        it("should send a notification when user is menioned in a post", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: ["test2"],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const user2 = await userService.getUserByUsername("test2");

            const notifications =
                await notificationService.getUserNotifications(
                    user2,
                    "localhost:3000",
                    1,
                    10
                );

            const notification = notifications.data[0];
            expect(notification.recipient.username).toEqual(user2!.username);
            expect(notification.sender.username).toEqual(user1!.username);
            expect(notification.type).toEqual("mention");
        });

        it("should not send a notification when user is mentioned in own post", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: ["test"],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            expect(notifications.data.length).toEqual(0);
        });

        it("should send a notification when user is menioned in an updated post", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: [],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            await postService.updatePost(
                user1!,
                post.id,
                {
                    caption: "test caption",
                    mentions: ["test2"],
                    close_status: "normal",
                    deletedImages: [],
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const user2 = await userService.getUserByUsername("test2");

            const notifications =
                await notificationService.getUserNotifications(
                    user2,
                    "localhost:3000",
                    1,
                    10
                );

            const notification = notifications.data[0];
            expect(notification.recipient.username).toEqual(user2!.username);
            expect(notification.sender.username).toEqual(user1!.username);
            expect(notification.type).toEqual("mention");
        });

        it("should delete a notification when user is removed from mentions in an updated post", async () => {
            const user1 = await userService.getUserByUsername("test");
            const post = await postService.createPost(
                user1!,
                {
                    caption: "test caption",
                    mentions: ["test2"],
                    close_status: "normal",
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            await postService.updatePost(
                user1!,
                post.id,
                {
                    caption: "test caption",
                    mentions: [],
                    close_status: "normal",
                    deletedImages: [],
                },
                ["testfile.jpg"],
                "localhost:3000"
            );

            const user2 = await userService.getUserByUsername("test2");

            const notifications =
                await notificationService.getUserNotifications(
                    user2,
                    "localhost:3000",
                    1,
                    10
                );

            expect(notifications.data.length).toBe(0);
        });
    });

    describe("follow notifications", () => {
        it("should send a notification when user is followed", async () => {
            const user1 = await userService.getUserByUsername("test");
            const user2 = await userService.getUserByUsername("test2");
            await userRelationService.follow(user2, "test");

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            const notification = notifications.data[0];
            expect(notification.recipient.username).toEqual(user1!.username);
            expect(notification.sender.username).toEqual(user2!.username);
            expect(notification.type).toEqual("followed");
        });

        it("should send notifications to sender followers when user is followed", async () => {
            const user1 = await userService.getUserByUsername("test");
            const user2 = await userService.getUserByUsername("test2");
            const user3 = await userService.getUserByUsername("test3");
            await userRelationService.follow(user3, "test2");
            await userRelationService.follow(user2, "test");

            const notifications =
                await notificationService.getUserFollowingsNotifications(
                    user3,
                    "localhost:3000",
                    1,
                    10
                );

            const notification = notifications.data[0];
            expect(notification.recipient.username).toEqual(user2!.username);
            expect(notification.sender.username).toEqual(user1!.username);
            expect(notification.type).toEqual("followed");
        });

        it("should send a notification when follow request is sent to private user", async () => {
            const user1 = await userService.getUserByUsername("test");
            const user2 = await userService.getUserByUsername("test2");
            await userService.editProfile(
                user1!,
                "",
                {
                    email: "test@gmail.com",
                    firstname: "",
                    lastname: "",
                    profileStatus: "private",
                    bio: "",
                    password: "",
                },
                "http://localhost:3000"
            );

            await userRelationService.follow(user2, "test");

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            const notification = notifications.data[0];
            expect(notification.recipient.username).toEqual(user1!.username);
            expect(notification.sender.username).toEqual(user2!.username);
            expect(notification.type).toEqual("followRequest");
        });

        it("should send a notification when follow request is accepted", async () => {
            const user1 = await userService.getUserByUsername("test");
            const user2 = await userService.getUserByUsername("test2");
            await userService.editProfile(
                user1!,
                "",
                {
                    email: "test@gmail.com",
                    firstname: "",
                    lastname: "",
                    profileStatus: "private",
                    bio: "",
                    password: "",
                },
                "http://localhost:3000"
            );

            await userRelationService.follow(user2, "test");
            await userRelationService.acceptFollowRequest(user1, "test2");

            const user1Notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            const user1Notification = user1Notifications.data[0];
            expect(user1Notification.recipient.username).toEqual(
                user1!.username
            );
            expect(user1Notification.sender.username).toEqual(user2!.username);
            expect(user1Notification.type).toEqual("followed");

            const user2Notifications =
                await notificationService.getUserNotifications(
                    user2,
                    "localhost:3000",
                    1,
                    10
                );

            const user2notification = user2Notifications.data[0];
            expect(user2notification.recipient.username).toEqual(
                user2!.username
            );
            expect(user2notification.sender.username).toEqual(user1!.username);
            expect(user2notification.type).toEqual("requestAccepted");
        });

        it("should delete a notification when user is unfollowed", async () => {
            const user1 = await userService.getUserByUsername("test");
            const user2 = await userService.getUserByUsername("test2");
            await userRelationService.follow(user2, "test");
            await userRelationService.unfollow(user2, "test");

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            expect(notifications.data.length).toBe(0);
        });

        it("should delete notifications to sender followers when user is unfollowed", async () => {
            const user1 = await userService.getUserByUsername("test");
            const user2 = await userService.getUserByUsername("test2");
            const user3 = await userService.getUserByUsername("test3");
            await userRelationService.follow(user3, "test2");
            await userRelationService.follow(user2, "test");
            await userRelationService.unfollow(user2, "test");

            const notifications =
                await notificationService.getUserFollowingsNotifications(
                    user3,
                    "localhost:3000",
                    1,
                    10
                );

            expect(notifications.data.length).toBe(0);
        });

        it("should delete a notification when follow request is rejected", async () => {
            const user1 = await userService.getUserByUsername("test");
            const user2 = await userService.getUserByUsername("test2");
            await userService.editProfile(
                user1!,
                "",
                {
                    email: "test@gmail.com",
                    firstname: "",
                    lastname: "",
                    profileStatus: "private",
                    bio: "",
                    password: "",
                },
                "http://localhost:3000"
            );

            await userRelationService.follow(user2, "test");
            await userRelationService.rejectFollowRequest(user1, "test2");

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            expect(notifications.data.length).toBe(0);
        });

        it("should delete a notification when follow request is accepted and then unfollowed", async () => {
            const user1 = await userService.getUserByUsername("test");
            const user2 = await userService.getUserByUsername("test2");
            await userService.editProfile(
                user1!,
                "",
                {
                    email: "test@gmail.com",
                    firstname: "",
                    lastname: "",
                    profileStatus: "private",
                    bio: "",
                    password: "",
                },
                "http://localhost:3000"
            );

            await userRelationService.follow(user2, "test");
            await userRelationService.acceptFollowRequest(user1, "test2");
            await userRelationService.unfollow(user2, "test");

            const user1Notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            expect(user1Notifications.data.length).toBe(0);

            const user2Notifications =
                await notificationService.getUserNotifications(
                    user2,
                    "localhost:3000",
                    1,
                    10
                );

            expect(user2Notifications.data.length).toBe(0);
        });

        it("should delete notifications when blocked", async () => {
            const user1 = await userService.getUserByUsername("test");
            const user2 = await userService.getUserByUsername("test2");
            await userService.editProfile(
                user1!,
                "",
                {
                    email: "test@gmail.com",
                    firstname: "",
                    lastname: "",
                    profileStatus: "private",
                    bio: "",
                    password: "",
                },
                "http://localhost:3000"
            );

            await userRelationService.follow(user2, "test");
            await userRelationService.acceptFollowRequest(user1, "test2");
            await userRelationService.block(user2, "test");

            const user1Notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            expect(user1Notifications.data.length).toBe(0);

            const user2Notifications =
                await notificationService.getUserNotifications(
                    user2,
                    "localhost:3000",
                    1,
                    10
                );

            expect(user2Notifications.data.length).toBe(0);
        });

        it("should not send a new notification when user is added to close friends and then removed", async () => {
            const user1 = await userService.getUserByUsername("test");
            const user2 = await userService.getUserByUsername("test2");
            await userRelationService.follow(user2, "test");
            await userRelationService.addCloseFriend(user1, "test2");
            await userRelationService.removeCloseFriend(user1, "test2");

            const notifications =
                await notificationService.getUserNotifications(
                    user1,
                    "localhost:3000",
                    1,
                    10
                );

            expect(notifications.data.length).toBe(1);
            const notification = notifications.data[0];
            expect(notification.recipient.username).toEqual(user1!.username);
            expect(notification.sender.username).toEqual(user2!.username);
            expect(notification.type).toEqual("followed");
        });
    });
});
