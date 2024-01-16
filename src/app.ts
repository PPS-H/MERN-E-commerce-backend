import express from "express";
import { connectToDB } from "./utils/features.js";
import userRoutes from "./routes/user.js";
import { errorMiddleware  } from "./middlewares/error.js";

const port = 5000;
const app = express();

connectToDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is working on /api/v1");
});

app.use("/api/v1/user", userRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
