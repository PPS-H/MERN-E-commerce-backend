import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
    },
    photo: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
        required: [true, "Please add product photo"],
      },
    },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
    },
    category: {
      type: String,
      required: [true, "Please enter product category"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
