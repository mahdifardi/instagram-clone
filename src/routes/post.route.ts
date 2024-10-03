import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { postUpload } from "../middlewares/upload.middleware";
import { postDto } from "../modules/postHandler/post/dto/post.dto";
import { handleExpress } from "../utility/handle-express";
import { commentDto } from "../modules/postHandler/comment/dto/comment.dto";
import { PostHandler } from "../modules/postHandler/postHandler";
import { UserHandler } from "../modules/userHandler/userHandler";
import { extractNumberedFields } from "../utility/extract-numbered-fields";
import { updatePostDto } from "../modules/postHandler/post/dto/updatePost.dto";

export const makePostRouter = (
    userHandler: UserHandler,
    postHandler: PostHandler
) => {
    const app = Router();

    app.post("/createpost", auth(userHandler), postUpload, (req, res) => {
        const mentions = req.body.mentions
            ? req.body.mentions
            : extractNumberedFields<string>(req.body, "mentions");

        if (!req.files || req.files.length == 0) {
            return res
                .status(400)
                .json({ message: "Posts require at least one image" });
        }

        const files = req.files as Express.Multer.File[];
        const images = Array.isArray(!files)
            ? files
            : files.filter((file) => file.fieldname.startsWith("images"));

        const dto = postDto.parse({
            caption: req.body.caption,
            mentions,
            close_status: req.body.close_status,
        });
        const postImageFilenames = images.map((file) => file.filename);

        handleExpress(
            res,
            async () =>
                await postHandler.createPost(
                    req.user,
                    dto,
                    postImageFilenames,
                    req.base_url
                )
        );
    });

    app.post(
        "/updatepost/:postid",
        auth(userHandler),
        postUpload,
        (req, res) => {
            const postid = req.params.postid;
            const mentions = req.body.mentions
                ? req.body.mentions
                : extractNumberedFields<string>(req.body, "mentions");
            const deletedImages = req.body.deletedImages
                ? req.body.deletedImages
                : extractNumberedFields<string>(req.body, "deletedImages");

            const files = req.files as Express.Multer.File[];
            const images = Array.isArray(!files)
                ? files
                : files.filter((file) => file.fieldname.startsWith("images"));

            const dto = updatePostDto.parse({
                caption: req.body.caption,
                mentions,
                deletedImages,
                close_status: req.body.close_status,
            });
            const postImageFilenames = images.map((file) => file.filename);

            handleExpress(res, () =>
                postHandler.updatePost(
                    req.user,
                    postid,
                    dto,
                    postImageFilenames,
                    req.base_url
                )
            );
        }
    );

    app.post("/comment", auth(userHandler), (req, res) => {
        const dto = commentDto.parse(req.body);
        handleExpress(res, () => postHandler.createComment(req.user, dto));
    });

    app.post("/likepost/:postid", auth(userHandler), (req, res) => {
        const postid = req.params.postid;
        handleExpress(res, () => postHandler.likePostHandler(req.user, postid));
    });

    // app.post("/unlikepost/:postid", auth(userHandler), (req, res) => {
    //     const postid = req.params.postid;
    //     handleExpress(res, () =>
    //         postHandlerService.unLikePost(req.user, postid)
    //     );
    // });

    app.post("/likecomment/:commentid", auth(userHandler), (req, res) => {
        const commentid = req.params.commentid;
        handleExpress(res, () =>
            postHandler.likeCommentHandler(req.user, commentid)
        );
    });

    // app.post("/unlikecomment/:commentid", auth(userHandler), (req, res) => {
    //     const commentid = req.params.commentid;
    //     handleExpress(res, () =>
    //         postHandlerService.unLikeComment(req.user, commentid)
    //     );
    // });

    app.get("/comments/:postid", auth(userHandler), (req, res) => {
        const postid = req.params.postid;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        handleExpress(res, () =>
            postHandler.commentList(req.user, postid, page, limit, req.base_url)
        );
    });

    app.get("/searchsuggestions/:query", auth(userHandler), (req, res) => {
        const query = req.params.query;
        const limit = parseInt(req.query.limit as string) || 5;

        handleExpress(res, () =>
            postHandler.getPostSearchSuggestion(req.user, query, limit)
        );
    });

    app.get("/postsearch/:query", auth(userHandler), (req, res) => {
        const query = req.params.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 24;

        handleExpress(res, () =>
            userHandler.postSearch(req.user, query, page, limit, req.base_url)
        );
    });

    app.get("/:postid", auth(userHandler), (req, res) => {
        const postId: string = req.params.postid;
        handleExpress(
            res,
            async () =>
                await postHandler.getPostByPostId(
                    req.user,
                    postId,
                    req.base_url
                )
        );
    });

    return app;
};
