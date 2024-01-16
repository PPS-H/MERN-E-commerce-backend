import mongoose from "mongoose";
import validator from "validator";
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, "Please enter ID"],
    },
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: [true, "Email already exists"],
        validator: validator.default.isEmail,
    },
    photo: {
        type: String,
        required: [true, "Please add your photo"],
    },
    dob: {
        type: Date,
        required: [true, "Please add your Date of Birth"],
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "Please enter your gender"],
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
}, {
    timestamps: true,
});
userSchema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if ((dob.getMonth() === today.getMonth() && today.getDate() < dob.getDate()) ||
        today.getMonth() < dob.getMonth()) {
        age--;
    }
    return age;
});
export default mongoose.model("User", userSchema);
