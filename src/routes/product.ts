import express from "express";
import {
  addNewProduct,
  deleteProduct,
  getAllCategories,
  getAllProducts,
  getLatestProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/product.js";
import { singleUpload } from "../middlewares/multre.js";

const app = express.Router();

// Get all Products
app.get("/all", getAllProducts);
// Add a new Product
app.post("/new", singleUpload, addNewProduct);
// Get latest products
app.get("/latest", getLatestProducts);
// Get Categories
app.get("/categories", getAllCategories);
app
  .route("/:id")
  .get(getSingleProduct) // Get Single Product
  .put(singleUpload, updateProduct) // Update an existing product
  .delete(deleteProduct); // Delete a Product

export default app;
