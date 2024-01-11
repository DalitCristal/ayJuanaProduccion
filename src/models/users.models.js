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

function lastConnection() {
  let time = Date.now();

  const date = new Date(time);

  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);

  const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

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
    type: String,
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

userSchema.methods.updateLastConnection = function () {
  this.last_connection = lastConnection();
};

export const userModel = model("users", userSchema);
