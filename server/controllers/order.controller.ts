import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, {IOrder} from "../models/order.model";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import path from "path";
import sendMail from "../utils/sendMail";
import ejs from "ejs";
import NotificationModel from "../models/notification.model";
import { getAllOrdersService, newOrder } from "../services/order.service";

// Create an order
export const createOrder = CatchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    try {
        
        const { courseId, payment_info } = req.body as IOrder;

        const user = await userModel.findById(req.user?._id);

        const courseExistsinUser = user?.courses.some((course:any) => course._id.toString() === courseId)
        if (courseExistsinUser) {
            return next(new ErrorHandler("You have already this course", 400));
        }

        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        const data:any = {
            courseId: course._id,
            userId: user?._id,
            payment_info,
        }

        newOrder(data, res, next);

        const mailData = {
            order: {
                _id: course._id.toString().slice(0,6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}),
            }
        }

        const html = await ejs.renderFile(path.join(__dirname, '../mails/order-confirmation.ejs'), {order:mailData});

        try {
            if (user) {
                await sendMail({
                    email: user.email,
                    subject: 'Order confirmation',
                    template: "order-confirmation.ejs",
                    data: mailData
                });
            }
        } catch (error:any) {
            return next(new ErrorHandler(error.message, 500));
        }

        user?.courses.push(course?._id);

        await user?.save();

        await NotificationModel.create({
            user: user?._id,
            title: "New Experience",
            message: `You have a new order from ${course?.name}`,
        });

        course.purchased ? course.purchased += 1 : course.purchased;

        await course.save();

        newOrder(data, res, next);

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Get All Orders -- only admin
export const getAllOrders = CatchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    try {

        getAllOrdersService(res);
        
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});