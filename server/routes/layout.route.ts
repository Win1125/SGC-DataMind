import express from "express";
import { isAuthenticated, validateRole } from "../middleware/auth";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller";
const layoutRouter = express.Router();

// GET
layoutRouter.get('/get-layout', isAuthenticated, getLayoutByType);

// POST
layoutRouter.post('/create-layout', isAuthenticated, validateRole("admin"), createLayout);

// PUT
layoutRouter.put('/edit-layout', isAuthenticated, validateRole("admin"), editLayout);

export default layoutRouter; 