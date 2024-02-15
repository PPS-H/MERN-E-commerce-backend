import express from "express";
import {
  ChangeUserRole,
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
} from "../controllers/user.js";
import { AdminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/new", createUser);
app.get("/all", AdminOnly, getAllUsers);
app
  .route("/:id")
  .get(getUser)
  .put(AdminOnly, ChangeUserRole)
  .delete(AdminOnly, deleteUser);

export default app;
