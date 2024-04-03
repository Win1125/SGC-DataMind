import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (
    error:any,
    req:Request,
    res:Response,
    next:NextFunction) => {

    error.statusCode = error.statusCode || 500;
    error.message = error.message || 'Internal Server Error';

    //Wrong MongoDB ID Error
    if(error.name === 'CastError'){
        const message = `Resource not found. Invalid: ${error.path}`;
        error = new ErrorHandler(message, 400);
    }

    //Duplicate Key Error
    if(error.code === 11000){
        const message = `Duplicate ${Object.keys(error.keyValue)} entered`;
        error = new ErrorHandler(message, 400);
    }

    //Wrong JWT Error
    if(error.name === 'JsonWebTokenError'){
        const message = `Json Web Token not found. Try again`;
        error = new ErrorHandler(message, 400);
    }

    //JWT Expire Error
    if(error.name === 'TokenExpiredError'){
        const message = `Json Web Token is expired. Try again`;
        error = new ErrorHandler(message, 400);
    }


    res.status(error.statusCode).json({
        success: false,
        message: error.message
    })
}