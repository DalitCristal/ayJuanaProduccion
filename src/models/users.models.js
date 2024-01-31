import "dotenv/config";
import { Schema, model } from "mongoose";
import { cartModel } from "./carts.models.js";
import paginate from "mongoose-paginate-v2";

const documentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema({
  first_name: {
    type: String,
    trim: true,
    required: true,
  },
  last_name: {
    type: String,
    trim: true,
    required: true,
    index: true,
  },
  age: {
    type: Number,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    default: "user",
  },
  cart: {
    type: Schema.Types.ObjectId,
    ref: "carts",
  },
  documents: [documentSchema],
  last_connection: {
    type: Date,
    default: Date.now(),
  },
  profilePicture: {
    type: String,
  },
});

userSchema.plugin(paginate);

userSchema.pre("save", async function (next) {
  try {
    if (!this.cart) {
      const newCart = await cartModel.create({});
      this.cart = newCart._id;
    }
  } catch (error) {
    next(error);
  }
});

export const userModel = model("users", userSchema);
