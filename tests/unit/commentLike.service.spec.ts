import { randomUUID } from "crypto";
import { CommentService } from "../../src/modules/postHandler/comment/comment.service";
import { CommentLikeService } from "../../src/modules/postHandler/commentLike/commentLike.service";
import { PostService } from "../../src/modules/postHandler/post/post.service";
import { UserService } from "../../src/modules/userHandler/user/user.service";
import { BadRequestError, NotFoundError } from "../../src/utility/http-errors";
import { ServiceFactory } from "../../src/utility/service-factory";
import { createTestDb } from "../../src/utility/test-db";

describe("CommentLikeService test suite", () => {
    let serviceFactory: ServiceFactory;
    let commentLikeService: CommentLikeService;
    let userService: UserService;
    let postService: PostService;
    let commentService: CommentService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        commentLikeService = serviceFactory.getCommentLikeService();
        userService = serviceFactory.getUserService();
        postService = serviceFactory.getPostService();
        commentService = serviceFactory.getCommentService();

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

    it("should throw NotFoundError if comment is not found when liking a comment", async () => {
        const user = await userService.getUserByUsername("test");

        await expect(
            commentLikeService.likeComment(user!, randomUUID())
        ).rejects.toThrow(NotFoundError);
    });

    it("should throw BadRequestError if comment is already liked", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            {
                caption: "test caption",
                mentions: ["test2", "test3"],
                close_status: "normal",
            },
            ["testfile.jpg"],
            "localhost:3000"
        );
        const comment = await commentService.createComment(user!, {
            postId: post.id,
            text: "Test comment",
        });

        await commentLikeService.likeComment(user!, comment.id);

        await expect(
            commentLikeService.likeComment(user!, comment.id)
        ).rejects.toThrow(BadRequestError);
    });

    it("should like a comment successfully if not already liked", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            {
                caption: "test caption",
                mentions: ["test2", "test3"],
                close_status: "normal",
            },
            ["testfile.jpg"],
            "localhost:3000"
        );
        const comment = await commentService.createComment(user!, {
            postId: post.id,
            text: "Test comment",
        });

        const result = await commentLikeService.likeComment(user!, comment.id);

        expect(result.message).toEqual("Comment liked");
    });

    it("should throw BadRequestError if comment is not liked but trying to unlike", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            {
                caption: "test caption",
                mentions: ["test2", "test3"],
                close_status: "normal",
            },
            ["testfile.jpg"],
            "localhost:3000"
        );
        const comment = await commentService.createComment(user!, {
            postId: post.id,
            text: "Test comment",
        });
        await expect(
            commentLikeService.unLikeComment(user!, comment.id)
        ).rejects.toThrow(BadRequestError);
    });

    it("should unlike a comment successfully if liked", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            {
                caption: "test caption",
                mentions: ["test2", "test3"],
                close_status: "normal",
            },
            ["testfile.jpg"],
            "localhost:3000"
        );
        const comment = await commentService.createComment(user!, {
            postId: post.id,
            text: "Test comment",
        });

        await commentLikeService.likeComment(user!, comment.id);

        const result = await commentLikeService.unLikeComment(
            user!,
            comment.id
        );

        expect(result.message).toEqual("Comment unliked");
    });
});
