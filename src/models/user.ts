import mongoose from "mongoose";
import validator from "validator";

//Document provided some inherit methods and properties to the mongoose documents so it'll good to extend it when working with own custom schemas for mongoose models.
interface User extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  dob: Date;
  gender: "male" | "female";
  role: "admin" | "user";
  age: number;
  createdAt: Date; //If timestamps are true, then it will be automatically provided my mongoose model,but needs to define when using own custom schemas.
  updateAt: Date; //If timestamps are true, then it will be automatically provided my mongoose model,but needs to define when using own custom schemas.
}

const userSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("age").get(function () {
  const today = new Date();
  const dob: Date = this.dob;
  let age = today.getFullYear() - dob.getFullYear();
  if (
    (dob.getMonth() === today.getMonth() && today.getDate() < dob.getDate()) ||
    today.getMonth() < dob.getMonth()
  ) {
    age--;
  }
  return age;
});

export default mongoose.model<User>("User", userSchema);
