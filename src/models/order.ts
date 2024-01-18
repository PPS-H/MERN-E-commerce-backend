import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: [true, "Please enter address"],
      },
      city: {
        type: String,
        required: [true, "Please enter city name"],
      },
      state: {
        type: String,
        required: [true, "Please enter state name"],
      },
      country: {
        type: String,
        required: [true, "Please enter country name"],
      },
      pinCode: {
        type: Number,
        required: [true, "Please enter pin code"],
      },
    },
    user: {
      type: String,
      required: [true],
      ref: "User",
    },
    subtotal: {
      type: Number,
      required: [true],
    },
    tax: {
      type: Number,
      required: [true],
    },
    discount: {
      type: Number,
      default: 0,
    },
    shippingCharges: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: [true, "Please enter total amount"],
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },
    orderItems: [
      {
        name: { type: String, required: [true, "Please enter item name"] },
        photo: { type: String, required: [true, "Please enter item photo"] },
        price: { type: Number, required: [true, "Please enter item price"] },
        quantity: {
          type: Number,
          required: [true, "Please enter item quantity"],
        },
        productId: { type: mongoose.Types.ObjectId, ref: "Product" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
