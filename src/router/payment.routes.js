import { Router } from "express";
import {
  createOrder,
  createTicket,
  postEmailPaymentSuccess,
} from "../controllers/payment.controllers.js";

const paymentRouter = Router();

paymentRouter.post("/api/payment/create-order", createOrder);

paymentRouter.post("/api/payment/success", createTicket);

paymentRouter.post("/api/payment/mail", postEmailPaymentSuccess);

export default paymentRouter;
