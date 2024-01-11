import { Router } from "express";
import { passportError, authorization } from "../utils/messagesError.js";
import viewsCtrls from "../controllers/views.controllers.js";
import userRouter from "./users.routes.js";
import productRouter from "./products.routes.js";
import cartRouter from "./carts.routes.js";
import sessionRouter from "./session.routes.js";
import loggerRouter from "./loggerTest.routes.js";

const router = Router();
//Home
router.get("/static", viewsCtrls.renderHome);

//Chat
router.get(
  "/static/chat",
  passportError("jwt"),
  authorization("user"),
  viewsCtrls.renderChat
);

router.use("/", cartRouter);
router.use("/", productRouter);
router.use("/", userRouter);
router.use("/", sessionRouter);
router.use("/", loggerRouter);

export default router;
