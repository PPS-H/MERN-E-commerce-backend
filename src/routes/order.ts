import express from "express";
import { addNewOrder, allOrders, deleteOrder, getSingleOrder, myOrders, updateOrder  } from "../controllers/order.js";
import { AdminOnly } from "../middlewares/auth.js";

const app=express.Router()

// Add new order 
app.post("/new",addNewOrder)

// Getting placed orders 
app.get("/myorders",myOrders )
// Getting all orders 
app.get("/all",AdminOnly,allOrders )

app.route("/:id").get(getSingleOrder).put(AdminOnly,updateOrder).delete(AdminOnly,deleteOrder);


export default app;