import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { OrderProps } from "../types/types.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Order from "../models/order.js";
import { cache, invalidateCache, reduceStock } from "../utils/features.js";

// Placing new order
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

    if (!shippingInfo || !user || !subtotal || !total || !orderItems) {
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
    await reduceStock(orderItems);

    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
    });

    res.status(200).json({
      success: true,
      message: "Order places successfully",
    });
  }
);

// Getting my orders
export const myOrders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // Will change after implementing JWT token
    const { id: user } = req.query;
    const key = `my-orders-${user}`;
    let orders = [];
    if (cache.has(key)) {
      orders = JSON.parse(cache.get(key) as string);
    } else {
      orders = await Order.find({ user });
      if (!orders) return next(new ErrorHandler("No orders!", 404));
      cache.set(key, JSON.stringify(orders));
    }
    res.status(200).json({
      success: true,
      orders,
    });
  }
);

//Get single order details
export const getSingleOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const key = `order-${id}`;
    let order;
    if (cache.has(key)) {
      order = JSON.parse(cache.get(key) as string);
    } else {
      order = await Order.findById(id);
      if (!order) return next(new ErrorHandler("Order not found", 404));
      cache.set(key, JSON.stringify(order));
    }
    res.status(200).json({
      success: true,
      order,
    });
  }
);

// Getting all orders
export const allOrders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const key = `all-orders`;
    let orders = [];
    if (cache.has(key)) {
      orders = JSON.parse(cache.get(key) as string);
    } else {
      orders = await Order.find({});
      if (!orders) return next(new ErrorHandler("No orders!", 404));
      cache.set(key, JSON.stringify(orders));
    }
    res.status(200).json({
      success: true,
      orders,
    });
  }
);

//Updating order Status
export const updateOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return next(new ErrorHandler("Order not found", 404));

    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      default:
        order.status = "Delivered";
        break;
    }
    await order.save();
    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: order.user!,
      orderId:String(order._id)
    });
    res.status(200).json({
      success: true,
      order,
    });
  }
);

//Deleting an order
export const deleteOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return next(new ErrorHandler("Order not found", 404));
    await order.deleteOne();
    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: order.user!,
      orderId:String(order._id)
    });    res.status(200).json({
      success: true,
      messsage: "Order deleted successfully",
    });
  }
);
