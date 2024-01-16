import ErrorHandler from "../utils/ErrorHandler.js";
import User from "../models/user.js";
import { TryCatch } from "./error.js";
export const AdminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return next(new ErrorHandler("Please make sure that you are logged in", 401));
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid credentials", 401));
    if (user.role !== "admin") {
        return next(new ErrorHandler("Invalid credentials", 401));
    }
    next();
});
