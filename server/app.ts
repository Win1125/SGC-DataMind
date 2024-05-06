import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
require("dotenv").config();
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import layoutRouter from "./routes/layout.route";
import analyticsRouter from "./routes/analytic.route";

//Body Parser
app.use(express.json({limit: "50mb"}));

//Cookie Parser
app.use(cookieParser());

//cors => cross origin resource sharing
app.use(cors({
    //origin: process.env.ORIGIN
    origin: ['http://localhost:3000'],
    credentials: true,
}));

//Routes
app.use("/api/v1", userRouter,courseRouter,orderRouter,notificationRouter, analyticsRouter, layoutRouter);

//Testing API
app.get("/test", (req:Request, res:Response, next:NextFunction) => {
    res.status(200).json({
        success: true,
        message: "Test successful, API works",
    })
});

//Unknow Route
app.all("*", (req:Request, res:Response, next:NextFunction) => {
    const error = new Error(`Invalid route: ${req.originalUrl} Not Found`) as any;
    error.statusCode = 404;
    next(error);
});

app.use(ErrorMiddleware);