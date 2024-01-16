import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
} from "../controllers/user.js";
import { AdminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/new", createUser);
app.get("/all", AdminOnly, getAllUsers);
app.route("/:id").get(AdminOnly, getUser).delete(AdminOnly, deleteUser);

export default app;
