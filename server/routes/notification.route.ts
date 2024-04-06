import express  from "express";
import { isAuthenticated, validateRole } from "../middleware/auth";
import { getNotifications, updateNotificationStatus } from "../controllers/notification.controller";
const notificationRouter = express.Router();

notificationRouter.get("/get-all-notifications", isAuthenticated, validateRole("admin"), getNotifications);
notificationRouter.put("/update-notification/:id", isAuthenticated, validateRole("admin"), updateNotificationStatus);

export default notificationRouter;