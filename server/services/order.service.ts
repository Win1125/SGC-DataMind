import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel from "../models/order.model";


// Create new order
export const newOrder = CatchAsyncError(async (data:any, res:Response, next:NextFunction) => {
    const order = await OrderModel.create(data);

    res.status(200).json({
        success: true,
        order
    });
})