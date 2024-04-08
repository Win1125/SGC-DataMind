import express from 'express';
import { 
    isAuthenticated, 
    validateRole 
} from '../middleware/auth';
import { 
    getCourseAnalytics, 
    getOrderAnalytics, 
    getUserAnalytics 
} from '../controllers/analytics.controller';
const analyticsRouter = express.Router();

analyticsRouter.get('/user-analytics', isAuthenticated, validateRole("admin"), getUserAnalytics)
analyticsRouter.get('/course-analytics', isAuthenticated, validateRole("admin"), getCourseAnalytics)
analyticsRouter.get('/order-analytics', isAuthenticated, validateRole("admin"), getOrderAnalytics)

export default analyticsRouter;