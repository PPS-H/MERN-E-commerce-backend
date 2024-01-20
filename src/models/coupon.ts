import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please provide coupon code"],
    unique: true,
  },
  amount: {
    type: Number,
    required: [true, "Please enter discount amount"],
  },
});

export default mongoose.model("Coupon", couponSchema);
