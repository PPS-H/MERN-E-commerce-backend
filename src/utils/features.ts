import mongoose from "mongoose";
import NodeCache from "node-cache";
import { CacheProps } from "../types/types.js";
import Product from "../models/product.js";

export const connectToDB = () => {
  mongoose
    .connect("mongodb://0.0.0.0:27017", {
      dbName: "MERN_Ecommerce",
    })
    .then((c) => console.log(`Db is conected to ${c.connection.host}`))
    .catch((e) => {
      console.log(e);
    });
};
export const cache = new NodeCache();

export const invalidateProductCache = async ({
  product,
  order,
}: CacheProps) => {
  if (product) {
    let cacheKeys = ["latest-products", "categories"];

    const products = await Product.find({}).select("_id");
    
    products.forEach((element,index) => {
      cacheKeys.push(String(element._id))
    });
    cache.del(cacheKeys);
  }
  if (order) {
  }
};
