import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ZodError) {
        res.status(400).send({ message: err.message });
        return;
    }

    if (err instanceof MulterError) {
        res.status(400).send({ message: err.message });
        return;
    }

    res.status(500);
};
