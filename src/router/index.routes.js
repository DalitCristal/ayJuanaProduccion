import { Router } from "express";
import userRouter from "./users.routes.js";
import productRouter from "./products.routes.js";
import cartRouter from "./carts.routes.js";
import sessionRouter from "./session.routes.js";
import paymentRouter from "./payment.routes.js";

const router = Router();

router.use("/", cartRouter);
router.use("/", productRouter);
router.use("/", userRouter);
router.use("/", sessionRouter);
router.use("/", paymentRouter);

export default router;
