import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { createOrder } from "../controllers/order.controller";

const orderRouter = express.Router();


//POST
orderRouter.post("/create-order", isAuthenticated, createOrder)


export default orderRouter;