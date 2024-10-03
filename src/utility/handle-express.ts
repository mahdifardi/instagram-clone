import { Response } from "express";
import { HttpError } from "./http-errors";

export const handleExpress = async <T>(
    res: Response,
    cb: () => Promise<T>,
    additionalAction?: (data: T) => void
) => {
    try {
        const data = await cb();
        if (additionalAction) {
            additionalAction(data);
        }

        res.status(200).send(data);
    } catch (error) {
        if (error instanceof HttpError) {
            res.status(error.status).send({ message: error.message });
            return;
        }
        console.log(error);
        res.status(500).send();
    }
};
