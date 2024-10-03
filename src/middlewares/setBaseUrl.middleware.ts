import { Request, Response, NextFunction } from "express";

export const setBaseUrl = (req: Request, res: Response, next: NextFunction) => {
    req.base_url = `${req.protocol}://${req.get("host")}`;
    next();
};
