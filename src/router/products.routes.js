import { Router } from "express";
import { passportError, authorization } from "../utils/messagesError.js";
import productCtrls from "../controllers/products.controllers.js";
import { addLogger } from "../config/logger.js";
import uploader from "../utils/uploader.js";

const productRouter = Router();
productRouter.use(addLogger);

//Obtener todos los productos
productRouter.get("/api/products", productCtrls.getProducts);

//Obtener un producto
productRouter.get("/api/products/:id", productCtrls.getProductById);

//Obtener un producto por su nombre
productRouter.post("/api/products/search", productCtrls.getProductByName);

//Crear nuevo producto
productRouter.post(
  "/api/products",
  passportError("jwt"),
  authorization(["admin", "premium"]),
  productCtrls.postProduct
);

//Editar producto
productRouter.put(
  "/api/products/:productId",
  passportError("jwt"),
  authorization(["admin", "premium"]),
  productCtrls.putProduct
);

//Eliminar producto
productRouter.delete(
  "/api/products/:id",
  passportError("jwt"),
  authorization(["admin", "premium"]),
  productCtrls.deleteProduct
);

//Subir imagen de producto
productRouter.post(
  "/api/products/:productId/thumbnails",
  passportError("jwt"),
  authorization(["admin", "premium"]),
  uploader.array("product", 10),
  productCtrls.uploadThumbnails
);

export default productRouter;
