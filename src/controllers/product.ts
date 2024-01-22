import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  NewProductProps,
  ProductQuery,
  baseQueryType,
} from "../types/types.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { rm } from "fs";
import Product from "../models/product.js";
import { isValidObjectId } from "mongoose";
import { cache, invalidateCache } from "../utils/features.js";
import "dotenv/config";

// Add a new Product
export const addNewProduct = TryCatch(
  async (
    req: Request<{}, {}, NewProductProps>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, stock, price, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please add product photo", 400));

    if (!name || !stock || !price || !category) {
      rm(photo.path, () => {
        console.log("File deleted");
      });
      return next(new ErrorHandler("Please add all the fields", 400));
    }

    await Product.create({
      name,
      category: category.toLowerCase(),
      stock,
      price,
      photo: photo.path,
    });
    await invalidateCache({ product: true,admin:true });

    res.status(200).json({
      success: true,
      message: "Product added succesfully",
    });
  }
);

// Update an existing product
export const updateProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const photo = req.file;
    const isValid = isValidObjectId(id);
    if (!isValid) {
      if (photo) rm(photo.path, () => {});
      return next(new ErrorHandler("Inavlid Product Id", 400));
    }
    const product = await Product.findById(id);
    if (!product) {
      if (photo) rm(photo.path, () => {});
      return next(new ErrorHandler("Product not found", 404));
    }
    const { name, category, stock, price } = req.body;
    if (photo) {
      rm(product.photo, () => {
        console.log("Old photo deleted");
      });
    }
    if (name) product.name = name;
    if (category) product.category = category;
    if (stock) product.stock = stock;
    if (price) product.price = price;
    if (photo) product.photo = photo.path;
    product.save();
    await invalidateCache({ product: true,admin:true, productId: String(product._id) });

    res.status(200).json({
      success: true,
      message: "Product updated succesfully",
    });
  }
);

// Get latest products
export const getLatestProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let products;
    if (cache.get("latest-products")) {
      products = JSON.parse(cache.get("latest-products") as string);
    } else {
      products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
      cache.set("latest-products", JSON.stringify(products));
    }
    res.status(200).json({
      success: true,
      products,
    });
  }
);

// Get Single Product
export const getSingleProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let product;
    const { id } = req.params;

    if (cache.get(`product-${id}`)) {
      product = JSON.parse(cache.get(`product-${id}`) as string);
    } else {
      product = await Product.findById(id);
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }
      cache.set(`product-${id}`, JSON.stringify(product));
    }
    res.status(200).json({
      success: true,
      product,
    });
  }
);

// Get Categories
export const getAllCategories = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let categories;
    if (cache.get("categories")) {
      categories = JSON.parse(cache.get("latest-products") as string);
    } else {
      categories = await Product.distinct("category");
      cache.set("categories", JSON.stringify(categories));
    }
    res.status(200).json({ success: true, categories });
  }
);

// Delete a Product
export const deleteProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    rm(product.photo, () => {});

    await product.deleteOne();
    await invalidateCache({ product: true,admin:true, productId: String(product._id) });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  }
);

// Get all Products
export const getAllProducts = TryCatch(
  async (
    req: Request<{}, {}, {}, ProductQuery>,
    res: Response,
    next: NextFunction
  ) => {
    const { price, category, search, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE_LIMIT) || 8;
    const skip = (page - 1) * limit;

    let baseQuery: baseQueryType = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i", // Case insensitive
      };
    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };
    if (category) baseQuery.category = category;

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPages = Math.ceil(filteredOnlyProducts.length / limit);

    res.status(200).json({
      success: true,
      products,
      totalPages,
    });
  }
);
