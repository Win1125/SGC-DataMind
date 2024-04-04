import express from 'express';

import { 
    addAnswer,
    addQuestion,
    addReplyToReview,
    addReview,
    editCourse, 
    getAllCourses, 
    getCourseByUser, 
    getSingleCourse, 
    uploadCourse 
} from '../controllers/course.controller';

import { 
    isAuthenticated, 
    validateRole 
} from '../middleware/auth';

const courseRouter = express.Router();

// POST
courseRouter.post('/create-course', isAuthenticated, validateRole("admin"), uploadCourse);

// GET
courseRouter.get('/get-course/:id', getSingleCourse);
courseRouter.get('/get-courses', getAllCourses);
courseRouter.get('/get-course-content/:id', isAuthenticated, getCourseByUser);

// PUT
courseRouter.put('/edit-course/:id', isAuthenticated, validateRole("admin"), editCourse);
courseRouter.put('/add-question', isAuthenticated, addQuestion);
courseRouter.put('/add-answer', isAuthenticated, addAnswer);
courseRouter.put('/add-review/:id', isAuthenticated, addReview);
courseRouter.put('/add-reply', isAuthenticated, validateRole("admin"), addReplyToReview);

// DELETE


export default courseRouter;