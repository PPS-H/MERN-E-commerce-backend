import User from "../models/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { TryCatch } from "../middlewares/error.js";
export const createUser = TryCatch(async (req, res, next) => {
    const { _id, name, email, photo, gender, dob } = req.body;
    if (!_id || !name || !email || !photo || !gender || !dob) {
        return next(new ErrorHandler("Please add all the fields", 400));
    }
    let userAlreadyExists = await User.findById(_id);
    if (userAlreadyExists) {
        return next(new ErrorHandler("Invalid credentials", 400));
    }
    const user = await User.create({ _id, name, email, photo, gender, dob });
    res.status(201).json({
        success: true,
        message: `Welcome,${user.name}`,
    });
});
// Fetching all users
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    res.status(200).json({
        success: true,
        users,
    });
});
// Fetching a single user
export const getUser = TryCatch(async (req, res, next) => {
    const _id = req.params.id;
    const user = await User.findById(_id);
    if (!user) {
        return next(new ErrorHandler("User not found", 400));
    }
    res.status(200).json({
        success: true,
        user,
    });
});
// Deleting a user
export const deleteUser = TryCatch(async (req, res, next) => {
    const _id = req.params.id;
    const user = await User.findById(_id);
    if (!user) {
        return next(new ErrorHandler("User not found", 400));
    }
    await user.deleteOne();
    res.status(200).json({
        success: true,
        message: "User deleted succesfully",
    });
});
