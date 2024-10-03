import { Router } from "express";
import { signUpDto } from "../modules/userHandler/user/dto/signup.dto";
import { handleExpress } from "../utility/handle-express";
import { loginDto } from "../modules/userHandler/user/dto/login.dto";
import { auth } from "../middlewares/auth.middleware";
import { profileUpload } from "../middlewares/upload.middleware";
import { editProfileDto } from "../modules/userHandler/user/dto/edit-profile.dto";
import { UserHandler } from "../modules/userHandler/userHandler";

export const makeUserRouter = (userHandler: UserHandler) => {
    const app = Router();

    app.post("/signup", (req, res) => {
        const dto = signUpDto.parse(req.body);
        handleExpress(res, () => userHandler.createUser(dto));
    });

    app.post("/signin", (req, res) => {
        const dto = loginDto.parse(req.body);
        handleExpress(
            res,
            async () => {
                const loginResponse = await userHandler.login(dto, req.base_url);
                return loginResponse;
            }
            // ({ token }) => {
            //     res.cookie("token", token);
            // }
        );
    });

    app.post("/forgetpassword", (req, res) => {
        const { credential } = req.body;
        handleExpress(res, () => userHandler.forgetPassword(credential));
    });

    app.post("/resetpassword", (req, res) => {
        const { newPass, token } = req.body;
        handleExpress(res, () => userHandler.resetPassword(newPass, token));
    });

    app.post("/editprofile", auth(userHandler), profileUpload, (req, res) => {
        const dto = editProfileDto.parse(req.body);
        const pictureFilename = req.file ? req.file.filename : "";
        handleExpress(res, () =>
            userHandler.editProfile(
                req.user,
                pictureFilename,
                dto,
                req.base_url
            )
        );
    });

    app.get("/geteditprofile", auth(userHandler), (req, res) => {
        handleExpress(res, async () =>
            userHandler.getEditProfile(req.user, req.base_url)
        );
    });

    app.get("/profileInfo", auth(userHandler), (req, res) => {
        handleExpress(res, async () =>
            userHandler.getProfileInfo(req.user, req.base_url)
        );
    });

    app.post("/follow/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () => userHandler.follow(req.user, username));
    });

    app.post("/unfollow/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () => userHandler.unfollow(req.user, username));
    });

    app.post("/deletefollower/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            userHandler.deleteFollower(req.user, username)
        );
    });

    app.post("/acceptrequest/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            userHandler.acceptFollowRequest(req.user, username)
        );
    });

    app.post("/rejectrequest/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            userHandler.rejectFollowRequest(req.user, username)
        );
    });

    app.post("/block/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () => userHandler.blockHandler(req.user, username));
    });

    // app.post("/unblock/:username", auth(userHandler), (req, res) => {
    //     const username = req.params.username;
    //     handleExpress(res, () => userHandler.unblock(req.user, username));
    // });

    app.post("/addclosefriend/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            userHandler.addCloseFriendHandler(req.user, username)
        );
    });

    // app.post("/removeclosefriend/:username", auth(userHandler), (req, res) => {
    //     const username = req.params.username;
    //     handleExpress(res, () =>
    //         userHandler.removeCloseFriend(req.user, username)
    //     );
    // });

    app.get("/followers/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        handleExpress(res, () =>
            userHandler.followerList(
                req.user,
                username,
                page,
                limit,
                req.base_url
            )
        );
    });

    app.get("/followings/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        handleExpress(res, () =>
            userHandler.followeingList(
                req.user,
                username,
                page,
                limit,
                req.base_url
            )
        );
    });

    app.get("/closefriendlist", auth(userHandler), (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        handleExpress(res, () =>
            userHandler.closeFriendList(req.user, page, limit, req.base_url)
        );
    });

    app.get("/blocklist", auth(userHandler), (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        handleExpress(res, () =>
            userHandler.blockList(req.user, page, limit, req.base_url)
        );
    });

    app.get("/notifications", auth(userHandler), (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        handleExpress(res, () =>
            userHandler.getUserNotifications(
                req.user,
                req.base_url,
                page,
                limit
            )
        );
    });

    app.get("/followingsnotifications", auth(userHandler), (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        handleExpress(res, () =>
            userHandler.getUserFollowingsNotifications(
                req.user,
                req.base_url,
                page,
                limit
            )
        );
    });

    app.get("/explore", auth(userHandler), (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 24;

        handleExpress(res, () =>
            userHandler.explore(req.user, page, limit, req.base_url)
        );
    });

    app.post("/savepost/:postid", auth(userHandler), (req, res) => {
        const postid = req.params.postid;
        handleExpress(res, () => userHandler.savePostHandler(req.user, postid));
    });

    // app.post("/unsavepost/:postid", auth(userHandler), (req, res) => {
    //     const postid = req.params.postid;
    //     handleExpress(res, () => userHandler.unSavePost(req.user, postid));
    // });

    app.get("/mentions", auth(userHandler), (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 24;

        handleExpress(res, () =>
            userHandler.getMentionedPosts(req.user, page, limit, req.base_url)
        );
    });

    app.get("/searchsuggestions/:query", auth(userHandler), (req, res) => {
        const query = req.params.query;
        const limit = parseInt(req.query.limit as string) || 5;

        handleExpress(res, () =>
            userHandler.getUserSearchSuggestion(
                req.user,
                query,
                req.base_url,
                limit
            )
        );
    });

    app.get("/usersearch/:query", auth(userHandler), (req, res) => {
        const query = req.params.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        handleExpress(res, () =>
            userHandler.userSearch(req.user, query, req.base_url, page, limit)
        );
    });

    app.get("/suggestions", auth(userHandler), (req, res) => {
        const user = req.query.user as string;
        const post = req.query.post as string;
        const limit = parseInt(req.query.limit as string) || 5;

        handleExpress(res, () =>
            userHandler.suggestionHandler(
                req.user,
                user,
                post,
                limit,
                req.base_url
            )
        );
    });

    app.get("/search", auth(userHandler), (req, res) => {
        const user = req.query.user as string;
        const post = req.query.post as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 24;

        handleExpress(res, () =>
            userHandler.searchHandler(
                req.user,
                user,
                post,
                page,
                limit,
                req.base_url
            )
        );
    });

    app.get("/savedposts", auth(userHandler), (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 24;

        handleExpress(res, () =>
            userHandler.getSavedPosts(req.user, page, limit, req.base_url)
        );
    });

    app.get("/messages", auth(userHandler), (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;

        handleExpress(res, () =>
            userHandler.getUserThreads(req.user, page, limit, req.base_url)
        );
    });

    app.get("/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            userHandler.userProfile(req.user, username, req.base_url)
        );
    });

    return app;
};
