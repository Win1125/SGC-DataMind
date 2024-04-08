import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, {JwtPayload} from "jsonwebtoken";
import { redis } from "../utils/redis";

export const isAuthenticated = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) =>{

        const access_token = req.cookies.access_token;
        if(!access_token){
            return next(new ErrorHandler("Please login to access this resource", 400))
        }

        const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;
        if(!decoded) {
            return next(new ErrorHandler("Access token isn't valid", 400))
        }

        const user = await redis.get(decoded.id);
        if(!user){
            return next(new ErrorHandler("Please Login to access this resources", 400))
        }

        req.user = JSON.parse(user);

        next();
    }
);

// Validate user role
export const validateRole = (...roles: string[]) => {
    return (req:Request, res:Response, next:NextFunction) => {
        if(!roles.includes(req.user?.role || '')){
            return next(new ErrorHandler(`Invalid role ${req.user?.role}. This isn't allowed to access this resource`, 403));
        }
        next();
    }
}