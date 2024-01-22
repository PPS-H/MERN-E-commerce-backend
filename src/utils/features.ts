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
      productId.forEach((element) =>
        productCacheKeys.push(`product-${element}`)
      );
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
    let adminDashboardCacheKeys = ["admin-dashboard-stats","products-stats","sales-reports","yearly-reports"];
    cache.del(adminDashboardCacheKeys);
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

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percentage = ((thisMonth - lastMonth) / lastMonth) * 100;
  return percentage.toFixed(0);
};

export const getInventory = async ({
  categories,
  productsCount,
}: {
  categories: string[];
  productsCount: number;
}) => {
  const categoriesPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesPromise);

  let inventory: Record<string, number>[] = [];
  categories.forEach((category, i) => {
    inventory.push({
      [category]: Math.round((categoriesCount[i] / productsCount) * 100),
    });
  });
  return inventory;
};

interface ChartData extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}
interface ChartProps {
  length: number;
  chartData: ChartData[];
  property?: "discount" | "total";
}
export const getCharReports = ({ length, chartData, property }: ChartProps) => {
  const today = new Date();
  const chartNumbers = new Array(length).fill(0);

  chartData.forEach((data) => {
    let createdAt = data.createdAt;
    let yearDiff = today.getFullYear() - createdAt.getFullYear();
    let monthDiff = Math.abs(
      yearDiff * 12 + today.getMonth() - createdAt.getMonth()
    );
    if (monthDiff < length) {
      chartNumbers[length - monthDiff - 1] += property ? data[property] : 1;
    }
  });
  return chartNumbers;
};
