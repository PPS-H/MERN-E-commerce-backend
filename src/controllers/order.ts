import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { OrderProps } from "../types/types.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Order from "../models/order.js";

export const addNewOrder = TryCatch(
  async (
    req: Request<{}, {}, OrderProps>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      shippingInfo,
      user,
      subtotal,
      tax,
      discount,
      shippingCharges,
      total,
      orderItems,
    } = req.body;

    if (
      !shippingInfo ||
      !user ||
      !subtotal ||
      !total ||
      !orderItems
    ) {
      return next(new ErrorHandler("Please provide all the order fields", 400));
    }

    await Order.create({
      shippingInfo,
      user,
      subtotal,
      tax,
      discount,
      shippingCharges,
      total,
      orderItems,
    });

    res.status(200).json({
        success:true,message:"Order places successfully"
    })
  }
);
