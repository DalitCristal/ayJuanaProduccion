import mongoose from "mongoose";

function formatTimestamp() {
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
    type: String,
    default: formatTimestamp(),
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
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
