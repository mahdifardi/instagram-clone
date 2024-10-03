import { Server as SocketIOServer, Socket } from "socket.io";
import { UserHandler } from "./modules/userHandler/userHandler";
import { socketAuth } from "./middlewares/socketAuth.middleware";
import http from "http";
import { BadRequestError, NotFoundError } from "./utility/http-errors";
import { saveImage } from "./utility/save-image";
import { socketSetBaseUrl } from "./middlewares/socketSetBaseUrl.middleware";

export const setupSocketServer = (
    httpServer: http.Server,
    userHandler: UserHandler
) => {
    const io = new SocketIOServer(httpServer, {
        path: "/api/socket.io",
        cors: {
            credentials: true,
            origin: [
                "http://37.32.6.230",
                "http://localhost:3000",
                "http://localhost:5173",
                "https://minus-one.dev1403.rahnemacollege.ir",
            ],
            exposedHeaders: ["set-cookie", "ajax_redirect"],
            preflightContinue: true,
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
            optionsSuccessStatus: 200,
        },
    });

    io.use(socketAuth(userHandler));
    io.use(socketSetBaseUrl);

    io.on("connection", (socket) => {
        // let roomId: string;
        const onlineUsers: string[] = [];

        socket.on("join", async (username) => {
            try {
                const threadId = await userHandler.getThread(
                    socket.request.user,
                    username
                );

                const rooms = Array.from(socket.rooms);
                rooms.forEach((room) => {
                    if (room !== socket.id) {
                        socket.leave(room);
                    }
                });

                //roomId = threadId;
                socket.join(threadId);
                onlineUsers.push(socket.request.user.username);

                io.to(threadId).emit("connection", {
                    message: "User has joined the thread",
                    id: threadId,
                    status: 200,
                });
            } catch (error) {
                if (error instanceof NotFoundError) {
                    socket.emit("connection", {
                        message: "User not found",
                        status: 404,
                    });
                } else {
                    socket.emit("connection", {
                        message: "An unexpected error occurred",
                        status: 500,
                    });
                }
            }
        });

        socket.on("history", async (threadId, page = 1, limit = 100) => {
            try {
                if (!threadId) {
                    socket.emit("error", {
                        message: "Thread Id must be provided",
                        status: 400,
                    });
                } else {
                    const data = await userHandler.getThreadHistory(
                        threadId,
                        page,
                        limit,
                        socket.request.base_url
                    );
                    socket.emit("history", data);
                }
            } catch (error) {
                if (error instanceof NotFoundError) {
                    socket.emit("error", {
                        message: "User not found",
                        status: 404,
                    });
                } else {
                    socket.emit("error", {
                        message: "An unexpected error occurred",
                        status: 500,
                    });
                }
            }
        });

        socket.on(
            "newMessage",
            async (
                threadId: string,
                data: {
                    text?: string;
                    image?: string;
                }
            ) => {
                try {
                    if (!threadId) {
                        socket.emit("error", {
                            message: "Thread Id must be provided",
                            status: 400,
                        });
                    } else if (data.image) {
                        const imageBuffer = Buffer.from(data.image, "base64");
                        const image = await saveImage(imageBuffer);

                        const newImageMessage = await userHandler.newMessage(
                            socket.request.user,
                            threadId,
                            socket.request.base_url,
                            undefined,
                            image
                        );

                        io.to(threadId).emit("newMessage", newImageMessage);
                    } else if (data.text) {
                        const newMessageResponse = await userHandler.newMessage(
                            socket.request.user,
                            threadId,
                            socket.request.base_url,
                            data.text,
                            undefined
                        );

                        io.to(threadId).emit("newMessage", newMessageResponse);
                    } else {
                        socket.emit("error", {
                            message:
                                "Invalid message format. Must contain either text or image.",
                            status: 500,
                        });
                    }
                } catch (error) {
                    console.error("Error in newMessage handler:", error);
                    socket.emit("error", {
                        message: "Failed to send message.",
                        // error: error,
                        status: 500,
                    });
                }
            }
        );

        socket.on("deleteMessage", async (threadId, messageId) => {
            try {
                if (!threadId) {
                    socket.emit("error", {
                        message: "Thread Id must be provided",
                        status: 400,
                    });
                }
                await userHandler.deleteMessage(messageId)
                socket
                    .to(threadId)
                    .emit("deleteMessage", {
                        message: "Message deleted",
                        status: 200
                    });
            } catch (error) {
                if (error instanceof BadRequestError) {
                    socket.emit("error", {
                        message: "Invalid messageId",
                        status: 400,
                    });
                } else {
                    socket.emit("error", {
                        message: "An unexpected error occurred",
                        status: 500,
                    });
                }
            }
        });

        socket.on("onlineUsers", (threadId) => {
            try {
                if (!threadId) {
                    socket.emit("error", {
                        message: "Thread Id must be provided",
                        status: 400,
                    });
                }
                socket
                    .to(threadId)
                    .emit("onlineUsers", {
                        onlineUsers,
                    });
            } catch (error) {
                socket.emit("error", {
                    message: "An unexpected error occurred",
                    status: 500,
                });
            }
        });

        socket.on("typing", (threadId) => {
            try {
                if (!threadId) {
                    socket.emit("error", {
                        message: "Thread Id must be provided",
                        status: 400,
                    });
                }
                socket
                    .to(threadId)
                    .emit("typing", { username: socket.request.user.username });
            } catch (error) {
                socket.emit("error", {
                    message: "An unexpected error occurred",
                    status: 500,
                });
            }
        });

        socket.on("disconnect", (threadId) => {
            if (threadId) {
                socket.leave(threadId);
                const index = onlineUsers.indexOf(socket.request.user.username)
                onlineUsers.splice(index, 1)
            }
        });
    });

    return io;
};
