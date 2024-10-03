import { Request, Response, NextFunction } from "express";
import { UserHandler } from "../modules/userHandler/userHandler";
import { auth as expressAuth } from "./auth.middleware";
import { Socket } from "socket.io";

// Wrapper function to adapt Express middleware for Socket.IO
export const socketAuth = (userHandler: UserHandler) => {
    const expressMiddleware = expressAuth(userHandler);

    return (socket: Socket, next: (err?: any) => void) => {
        // Create a fake Express request object
        const req = {
            cookies: socket.handshake.headers.cookie
                ? parseCookies(socket.handshake.headers.cookie)
                : {},
            headers: {
                authorization: socket.handshake.headers.authorization || socket.handshake.auth?.token,
            },
            auth: socket.handshake.auth,
        } as unknown as Request;

        // Create a fake Express response object
        const res = {
            status: (code: number) => ({
                send: (data: any) => {
                    console.error(`Response ${code}:`, data);
                    next(new Error(`HTTP ${code}: ${data.error}`)); // Pass error to Socket.IO's `next` function
                },
            }),
        } as Response;

        // Create a fake Express next function
        const nextFunction: NextFunction = (err?: any) => {
            if (err) {
                console.error("Middleware error:", err);
                next(err);
            } else {
                socket.request.base_url = req.base_url;
                socket.request.user = req.user;
                next(); // Continue to next middleware or connection handler
            }
        };

        // Call the Express middleware with fake `req`, `res`, and `next`
        expressMiddleware(req, res, nextFunction);
    };
};

// Helper function to parse cookies from the `cookie` header
const parseCookies = (cookieHeader: string) => {
    return cookieHeader
        .split(";")
        .reduce((cookies: { [key: string]: string }, cookie: string) => {
            const [name, value] = cookie.split("=").map((c) => c.trim());
            cookies[name] = value;
            return cookies;
        }, {});
};
