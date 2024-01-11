import { Router } from "express";
import { passportError, authorization } from "../utils/messagesError.js";
import cartsCtrls from "../controllers/carts.controllers.js";
import { addLogger } from "../config/logger.js";

const cartRouter = Router();
cartRouter.use(addLogger);

cartRouter.get(
  "/api/carts",
  passportError("jwt"),
  authorization(["admin", "premium"]),
  cartsCtrls.getAllCarts
);

cartRouter.get(
  "/api/carts/:id",
  passportError("jwt"),
  authorization(["admin", "user"]),
  cartsCtrls.getCartById
);

cartRouter.post(
  "/api/carts/:cid/products/:pid",
  passportError("jwt"),
  authorization(["admin", "user"]),
  cartsCtrls.postAddProd
);

cartRouter.delete(
  "/api/carts/:cid/products/:pid",
  passportError("jwt"),
  authorization("user"),
  cartsCtrls.deleteProd
);

cartRouter.put(
  "/api/carts/:cid",
  passportError("jwt"),
  authorization("user"),
  cartsCtrls.putProds
);

cartRouter.put(
  "/api/carts/:cid/products/:pid",
  passportError("jwt"),
  authorization("user"),
  cartsCtrls.putQuantity
);

cartRouter.delete(
  "/api/carts/:cid",
  passportError("jwt"),
  authorization("user"),
  cartsCtrls.deleteProds
);

cartRouter.post(
  "/api/:cid/purchase",
  passportError("jwt"),
  authorization("user"),
  cartsCtrls.createTicket
);

export default cartRouter;
