import mongoose, { Document } from "mongoose";
import NodeCache from "node-cache";
import { CacheProps, OrderItems } from "../types/types.js";
import Product from "../models/product.js";
import ErrorHandler from "./ErrorHandler.js";

export const connectToDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "MERN_Ecommerce",
    })
    .then((c) => console.log(`Db is conected to ${c.connection.host}`))
    .catch((e) => {
      console.log(e);
    });
};
export const cache = new NodeCache();

export const invalidateCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: CacheProps) => {
  if (product) {
    let productCacheKeys = [`latest-products`, `categories`];
    if (typeof productId === "string") {
      productCacheKeys.push(`product-${orderId}`);
    }

    if (typeof productId === "object") {
      productId.forEach((element)=>productCacheKeys.push(`product-${element}`));
    }
    cache.del(productCacheKeys);
  }
  if (order) {
    let orderCacheKeys = [
      `my-orders-${userId}`,
      `all-orders`,
      `order-${orderId}`,
    ];
    cache.del(orderCacheKeys);
  }
  if (admin) {
  }
};

export const reduceStock = async (orderItems: OrderItems[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const { productId } = orderItems[i];
    let product = await Product.findById(productId);
    if (!product) throw new ErrorHandler("Product not found", 400);
    product.stock -= orderItems[i].quantity;
    await product.save();
  }
};
