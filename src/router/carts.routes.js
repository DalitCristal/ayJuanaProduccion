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
  authorization(["admin", "user", "premium"]),
  cartsCtrls.getCartById
);

cartRouter.post(
  "/api/carts/:cid/products/:pid",
  passportError("jwt"),
  authorization(["admin", "user", "premium"]),
  cartsCtrls.postAddProd
);

cartRouter.delete(
  "/api/carts/:cid/products/:pid",
  passportError("jwt"),
  authorization(["user", "premium"]),
  cartsCtrls.deleteProd
);

cartRouter.put(
  "/api/carts/:cid",
  passportError("jwt"),
  authorization(["user", "premium"]),
  cartsCtrls.putProds
);

cartRouter.put(
  "/api/carts/:cid/products/:pid",
  passportError("jwt"),
  authorization(["user", "premium"]),
  cartsCtrls.putQuantity
);

cartRouter.delete(
  "/api/carts/:cid",
  passportError("jwt"),
  authorization(["user", "premium"]),
  cartsCtrls.deleteProds
);

cartRouter.post(
  "/api/:cid/purchase",
  passportError("jwt"),
  authorization(["user", "premium"]),
  cartsCtrls.createTicket
);

export default cartRouter;
