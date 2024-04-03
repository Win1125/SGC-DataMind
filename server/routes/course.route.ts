import express from 'express';

import { 
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

courseRouter.post('/create-course', isAuthenticated, validateRole("admin"), uploadCourse);
courseRouter.put('/edit-course/:id', isAuthenticated, validateRole("admin"), editCourse);
courseRouter.get('/get-course/:id', getSingleCourse);
courseRouter.get('/get-courses', getAllCourses);
courseRouter.get('/get-course-content/:id', isAuthenticated, getCourseByUser);

export default courseRouter;