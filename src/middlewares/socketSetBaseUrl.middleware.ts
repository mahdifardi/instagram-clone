import { Socket } from "socket.io";

export const socketSetBaseUrl = (socket: Socket, next: (err?: any) => void) => {
    const protocol = socket.handshake.secure ? "https" : "http";
    socket.request.base_url = `${protocol}://${socket.handshake.headers.host}`;
    next();
};
