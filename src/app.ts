import express from "express";
import { connectToDB } from "./utils/features.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import { errorMiddleware } from "./middlewares/error.js";

const port = 5000;
const app = express();

connectToDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is working on /api/v1");
});

// User Routes 
app.use("/api/v1/user", userRoutes);
// Product Routes 
app.use("/api/v1/product", productRoutes);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
