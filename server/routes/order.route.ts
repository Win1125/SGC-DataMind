import express from "express";
import { isAuthenticated, validateRole } from "../middleware/auth";
import { createOrder, getAllOrders } from "../controllers/order.controller";

const orderRouter = express.Router();


//POST
orderRouter.post("/create-order", isAuthenticated, createOrder)

//GET
orderRouter.get("/get-orders", isAuthenticated, validateRole("admin"), getAllOrders);

export default orderRouter;