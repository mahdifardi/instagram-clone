import { UserService } from "../../src/modules/userHandler/user/user.service";
import { createTestDb } from "../../src/utility/test-db";
import { ServiceFactory } from "../../src/utility/service-factory";
import { PostService } from "../../src/modules/postHandler/post/post.service";
import { CommentService } from "../../src/modules/postHandler/comment/comment.service";
import { NotFoundError } from "../../src/utility/http-errors";
import { randomUUID } from "crypto";

describe("Comment service test suite", () => {
    let serviceFactory: ServiceFactory;
    let userService: UserService;
    let postService: PostService;
    let commentService: CommentService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

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

    it("should throw NotFoundError if post is not found", async () => {
        const user = await userService.getUserByUsername("test");
        const commentDto = {
            postId: randomUUID(),
            text: "Test comment",
        };

        await expect(
            commentService.createComment(user!, commentDto)
        ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if commentId is provided but comment is not found", async () => {
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

        const commentDto = {
            postId: post.id,
            text: "Test comment",
            commentId: randomUUID(),
        };

        await expect(
            commentService.createComment(user!, commentDto)
        ).rejects.toThrow(NotFoundError);
    });

    it("should create a comment successfully if post and user are valid", async () => {
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

        const commentDto = {
            postId: post.id,
            text: "Test comment",
            commentId: undefined,
        };

        const result = await commentService.createComment(user!, commentDto);
        expect(result.text).toEqual("Test comment");
    });

    it("should create a reply comment successfully if commentId is provided", async () => {
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

        const commentDto = {
            postId: post.id,
            text: "Reply comment",
            commentId: comment.id,
        };

        const result = await commentService.createComment(user!, commentDto);

        expect(result.parent!.id).toEqual(comment.id);
        expect(result.text).toEqual("Reply comment");
    });
});
