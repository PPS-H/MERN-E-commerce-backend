import express from "express";
import { connectToDB } from "./utils/features.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import ordersRoutes from "./routes/order.js";
import couponRoutes from "./routes/payments.js";
import AdminDashboardRoutes from "./routes/dashboard.js";
import { errorMiddleware } from "./middlewares/error.js";
import "dotenv/config";
import Stripe from "stripe";

const port = process.env.PORT;
const app = express();

const mongoUri = process.env.MONGO_URI;
const stripeKey = process.env.STRIPE_API_KEY || "";
connectToDB(mongoUri!);

app.use(express.json());
export const stripe = new Stripe(stripeKey);
app.get("/", (req, res) => {
  res.send("API is working on /api/v1");
});

// User Routes
app.use("/api/v1/user", userRoutes);
// Product Routes
app.use("/api/v1/product", productRoutes);
// Orders Routes
app.use("/api/v1/orders", ordersRoutes);
// Payments Routes
app.use("/api/v1/payments", couponRoutes);
// Dashboard Routes
app.use("/api/v1/dashboard", AdminDashboardRoutes);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
