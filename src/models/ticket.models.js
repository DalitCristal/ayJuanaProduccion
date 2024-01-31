import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
    default: function () {
      const timestamp = new Date().getTime();
      const randomValue = Math.random().toString(36).substr(2, 5);
      return `${timestamp}-${randomValue}`;
    },
  },
  purchase_datetime: {
    type: Date,
    default: Date.now(),
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  purchaser: {
    type: String,
    required: true,
  },
  payment_mp: {
    type: String,
    require: true,
  },
  status_mp: {
    type: String,
    require: true,
  },
  MerchantOrder_mp: {
    type: String,
    require: true,
  },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
