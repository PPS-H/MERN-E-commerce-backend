import express from "express";
import { AdminOnly } from "../middlewares/auth.js";
import { addNewCoupon, applyDiscount, createPayment, deleteCouponCode, getAllCoupons } from "../controllers/payments.js";

const app = express.Router();

app.post("/create",AdminOnly,createPayment);

//Checking coupon code discount amount
app.get("/discount",applyDiscount)
//Creating new coupon
app.post("/coupon/new",AdminOnly,addNewCoupon);
//Fetch all coupons codes
app.get("/coupon/all",AdminOnly,getAllCoupons);
// Delete coupon code
app.delete("/coupon/:id",AdminOnly,deleteCouponCode);


export default app;