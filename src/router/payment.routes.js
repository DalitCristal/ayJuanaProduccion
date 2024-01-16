import { Router } from "express";
import {
  createOrder,
  receiveWebhook,
} from "../controllers/payment.controllers.js";

const paymentRouter = Router();

paymentRouter.post("/create-order", createOrder);

paymentRouter.get("/success", (req, res) => {
  res.send("success");
});

paymentRouter.get("/failure", (req, res) => {
  res.send("failure");
});

paymentRouter.get("/pending", (req, res) => {
  res.send("pending");
});

paymentRouter.post("/webhook", receiveWebhook);

export default paymentRouter;
