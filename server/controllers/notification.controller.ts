import NotificationModel from "../models/notification.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import cron from "node-cron";

// Get all notifications -- only admin
export const getNotifications = CatchAsyncError( async (req:Request, res:Response, next: NextFunction) => {
    try {

        const notifications = await NotificationModel.find().sort({ createAt: -1 });
        
        res.status(201).json({
            success: true,
            notifications  
        });

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Update notification status -- only admin
export const updateNotificationStatus = CatchAsyncError( async (req:Request, res:Response, next: NextFunction) => {
    try {

        const notification = await NotificationModel.findById(req.params.id);
        
        if (!notification) {
            return next(new ErrorHandler("Notification Not Found", 404));
        }else {
            notification.status 
            ? (notification.status = 'read') 
            : notification?.status;
        }
        await notification.save();

        
        const notifications = await NotificationModel.find().sort({
            createAt: -1,
        });

        res.status(201).json({
            success: true,
            notifications
        });

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Delete notifications -- only admin
cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await NotificationModel.deleteMany({status:"read", createdAt: {$lt: thirtyDaysAgo}});
    console.info("Deleted Notifications");
})