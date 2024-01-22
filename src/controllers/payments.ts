import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Coupon from "../models/coupon.js";
import { stripe } from "../app.js";

//Creating Stripe Intent
export const createPayment = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { amount } = req.body;

    if (!amount)
      return next(
        new ErrorHandler("Please provide amount", 400)
      );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  }
);
//Adding new coupon
export const addNewCoupon = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { coupon, amount } = req.body;

    if (!coupon || !amount)
      return next(
        new ErrorHandler("Please provide coupon code and discount amount", 400)
      );

    await Coupon.create({ code: coupon, amount });
    res.status(200).json({
      success: true,
      message: `Coupon ${coupon} is succesfully created with discount amount ${amount}`,
    });
  }
);
// Applying discount
export const applyDiscount = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { coupon } = req.query;
    const discount = await Coupon.findOne({ code: coupon });
    if (!discount) return next(new ErrorHandler("Invalid coupon code", 400));

    res.status(200).json({
      success: true,
      discount: discount.amount,
    });
  }
);
// Fetching all coupons discount
export const getAllCoupons = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const coupons = await Coupon.find({});
    if (!coupons) return next(new ErrorHandler("Invalid coupon code", 400));

    res.status(200).json({
      success: true,
      coupons,
    });
  }
);

// Fetching all coupons discount
export const deleteCouponCode = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return next(new ErrorHandler("Invalid coupon code", 400));

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} Deleted Successfully`,
    });
  }
);
