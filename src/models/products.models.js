import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

const thumbnailSchema = new Schema({
  contentType: String,
  name: String,
});

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  thumbnails: {
    type: [thumbnailSchema],
    default: [],
  },
  owner: {
    type: Schema.Types.Mixed,
    ref: "users",
    default: "admin",
  },
});

productSchema.plugin(paginate);

export const productModel = model("products", productSchema);
