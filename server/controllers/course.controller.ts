import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs, { name } from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";

// Upload course
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = req.body;
        const thumbnail = data.thumbnail;

        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.url
            }
        }

        createCourse(data, res, next);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// Edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = req.body;
        const thumbnail = data.thumbnail;

        if (thumbnail) {

            await cloudinary.v2.uploader.destroy(thumbnail.public_id);

            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        const courseId = req.params.id;

        const course = await CourseModel.findByIdAndUpdate(
            courseId,
            { $set: data },
            { new: true }
        )

        res.status(201).json({
            success: true,
            course
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// Get Single Course -- without purchase
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const courseId = req.params.id;

        const isCacheExists = await redis.get(courseId);

        if (isCacheExists) {
            const course = JSON.parse(isCacheExists);

            res.status(200).json({
                success: true,
                course
            });
        } else {
            const course = await CourseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

            await redis.set(courseId, JSON.stringify(course));

            res.status(200).json({
                success: true,
                course
            });

        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// Get All Courses -- without purchase
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const isCacheExists = await redis.get("allCourses")

        if (isCacheExists) {
            const courses = JSON.parse(isCacheExists);

            res.status(200).json({
                success: true,
                courses
            });
        } else {
            const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

            await redis.set("allCourses", JSON.stringify(courses));

            res.status(200).json({
                success: true,
                courses
            });
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//Get course content -- only valid users
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        const courseExist = userCourseList?.find((course: any) => course._id.toString() === courseId);

        if (!courseExist) {
            return next(new ErrorHandler(`Course not found, please check your courses`, 404));
        }

        const course = await CourseModel.findById(courseId);
        const content = course?.courseData;

        res.status(200).json({
            success: true,
            content
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//Add question in Course
interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { question, courseId, contentId }: IAddQuestionData = req.body;
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler(`Invalid content id`, 400));
        }

        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId))

        if (!courseContent) {
            return next(new ErrorHandler(`Invalid content id`, 400));
        }

        // Create a new question object
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        }

        // Add this new question to course content
        courseContent.questions.push(newQuestion);

        await NotificationModel.create({
            user: req.user?._id,
            title: "New Question Received",
            message: `You have a new question in ${courseContent.title}`,
        });


        // Save the updated course
        await course?.save();

        res.status(200).json({
            success: true,
            course
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// Add Replie in a course question
interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const addAnswer = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;
        const course = await CourseModel.findById(courseId)

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler(`Invalid content id`, 400));
        }
        const courseContent = course?.courseData?.find((item: any) =>
            item._id.equals(contentId)
        )
        if (!courseContent) {
            return next(new ErrorHandler(`Invalid content id`, 400));
        }

        const question = courseContent?.questions?.find((item: any) =>
            item._id.equals(questionId)
        )
        if (!question) {
            return next(new ErrorHandler(`Invalid question id`, 400));
        }


        // Create a new answer object
        const newAnswer: any = {
            user: req.user,
            answer,
        }

        // Add this answer to the course content
        question.questionReplies?.push(newAnswer);

        await course?.save();

        if (req.user?._id === question.user._id) {
            // Create a notification
            await NotificationModel.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `You have a new question reply in ${courseContent.title}`,
            });
        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title
            }

            const html = await ejs.renderFile(
                path.join(__dirname, '../mails/question-reply.ejs'), 
                data
            );

            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data
                })
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 500));
            }
        }

        res.status(200).json({
            success: true,
            course
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// Add Review in Course
interface IAddReviewData {
    review: string;
    courseId: string;
    rating: number;
    userId: string;
}

export const addReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        // Check if course already exists in userCourseList
        const courseExists = userCourseList?.some((course: any) => course._id.toString() === courseId.toString());
        if (!courseExists) {
            return next(new ErrorHandler(`You're not eligible to access this course`, 404));
        }

        const course = await CourseModel.findById(courseId);
        const { review, rating } = req.body as IAddReviewData;
        const reviewData: any = {
            user: req.user,
            comment: review,
            rating: rating,
        }

        course?.reviews.push(reviewData);

        let avg = 0;
        course?.reviews.forEach((rev: any) => {
            avg += rev.rating;
        });
        if (course) {
            // One exxample we have 2 reviews one 
            // is 5 another one is 4 so 
            // math working like this = 9 / 2 = 4.5 ratings
            course.ratings = avg / course.reviews.length;
        }

        await course?.save();

        const notification = {
            title: "New Review Received",
            message: `${req.user?.name} has been give a review on your content ${course?.name}`,
        }

        //Create notification
        res.status(200).json({
            success: true,
            course,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// Add Reply in Review
interface IAddReviewData {
    comment: string;
    courseId: string;
    reviewId: string;
}

export const addReplyToReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { comment, courseId, reviewId } = req.body as IAddReviewData;

        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler(`Course not Found`, 404));
        }

        const review = course?.reviews?.find((r: any) => r._id.toString() === reviewId);
        if (!review) {
            return next(new ErrorHandler(`Review not Found`, 404));
        }

        const replyData: any = {
            user: req.user,
            comment,
        }

        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);

        await course?.save();

        res.status(200).json({
            success: true,
            course,
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})