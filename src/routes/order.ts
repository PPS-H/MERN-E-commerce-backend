import express from "express";
import { addNewOrder } from "../controllers/order.js";

const app=express.Router()

// Add new order 
app.post("/new",addNewOrder)

export default app;