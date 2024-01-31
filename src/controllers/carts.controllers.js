import { cartModel } from "../models/carts.models.js";
import { productModel } from "../models/products.models.js";
import { userModel } from "../models/users.models.js";
import Ticket from "../models/ticket.models.js";

const cartsCtrls = {};

cartsCtrls.getAllCarts = async (req, res) => {
  try {
    const carts = await cartModel.find();
    if (carts) {
      res.status(200).send({ respuesta: "OK", mensaje: carts });
    } else
      res.status(404).send({
        respuesta: "Error en consultar Carritos",
        mensaje: "No encontrados",
      });
  } catch (error) {
    res.status(400).send({
      respuesta: "Error en consultar todos los carritos",
      mensaje: error,
    });
  }
};

cartsCtrls.getCartById = async (req, res) => {
  const { id } = req.params;

  // Usuario autenticado
  const user = req.user.user;

  try {
    const cart = await cartModel.findById(id);

    if (cart) {
      res.status(200).send({ respuesta: "OK", mensaje: cart });
    } else
      res.status(404).send({
        respuesta: "Error en consultar Carrito",
        mensaje: "No encontrado",
      });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en consulta carrito", mensaje: error });
  }
};

cartsCtrls.postAddProd = async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    return;
  }
  try {
    const cart = await cartModel.findById(cid);
    if (cart) {
      const prod = await productModel.findById(pid);

      if (prod) {
        const indice = cart.products.findIndex((item) => item.id_prod == pid);
        if (indice != -1) {
          cart.products[indice].quantity = quantity;
        } else {
          cart.products.push({ id_prod: pid, quantity: quantity });
        }
        const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
        res.status(200).send({ respuesta: "OK", mensaje: respuesta });
      } else {
        res.status(404).send({
          respuesta: "Error en agregar producto Carrito",
          mensaje: "Producto no encontrado",
        });
      }
    } else {
      res.status(404).send({
        respuesta: "Error en agregar producto Carrito",
        mensaje: "carrito no encontrado",
      });
    }
  } catch (error) {
    req.logger.error(error);
    res
      .status(400)
      .send({ respuesta: "Error en agregar producto Carrito", mensaje: error });
  }
};

cartsCtrls.deleteProd = async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await cartModel.findById(cid);

    if (cart) {
      const prod = await productModel.findById(pid);

      if (prod) {
        const posicion = cart.products.findIndex(
          (item) => item.id_prod._id.toString() === prod._id.toString()
        );

        cart.products.splice(posicion, 1);

        const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
        res.status(200).send({ respuesta: "OK", mensaje: respuesta });
      } else {
        res.status(404).send({
          respuesta: "Error en eliminar producto Carrito",
          mensaje: "Producto no encontrado",
        });
      }
    } else {
      res.status(404).send({
        respuesta: "Error en eliminar producto Carrito",
        mensaje: "carrito no encontrado",
      });
    }
  } catch (error) {
    res.status(400).send({
      respuesta: "Error en eliminar producto de carrito",
      mensaje: error,
    });
  }
};

cartsCtrls.putProds = async (req, res) => {
  const { cid } = req.params;
  const arr = req.body;

  try {
    const cart = await cartModel.findById(cid);

    arr.forEach((p) => {
      let i = cart.products.findIndex((prod) => prod.id_prod._id == p.id_prod);

      if (i != -1) {
        cart.products[i] = p;
      } else {
        cart.products.push(p);
      }
    });

    const response = await cartModel.findByIdAndUpdate(cid, cart);

    res.status(200).send({
      respuesta: "Se actualizo cantidad en el carrito correctamente",
      mensaje: response,
    });
  } catch (error) {
    res.status(400).send({ respuesta: "Hubo un problema", mensaje: error });
  }
};

cartsCtrls.putQuantity = async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await cartModel.findById(cid);

    if (cart) {
      const prod = await productModel.findById(pid);

      if (prod) {
        if (quantity > prod.stock) {
          return res.status(400).json({
            mensaje: "No hay suficiente stock para la cantidad deseada",
          });
        }

        const indice = cart.products.findIndex(
          (item) => item.id_prod._id == pid
        );

        if (indice != -1) {
          cart.products[indice].quantity = quantity;
        } else {
          cart.products.push({ id_prod: pid, quantity: quantity });
        }

        const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
        res.status(200).send({
          respuesta: "Se actualizó la cantidad del producto en el carrito",
          mensaje: respuesta,
        });
      } else {
        res.status(404).send({
          respuesta: "Error en actualizar cantidad de producto Carrito",
          mensaje: "Producto no encontrado",
        });
      }
    } else {
      res.status(404).send({
        respuesta: "Error en actualizar cantidad de producto Carrito",
        mensaje: "carrito no encontrado",
      });
    }
  } catch (error) {
    req.logger.error(error);
    res.status(400).send({
      respuesta: "Error en actualizar cantidad de producto Carrito",
      mensaje: error,
    });
  }
};

cartsCtrls.deleteProds = async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await cartModel.findById(cid);

    cart.products = [];

    const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
    res.status(200).send({ respuesta: "OK", mensaje: respuesta });
  } catch (error) {
    res.status(400).send({
      respuesta: "Error en eliminar todos los productos Carrito",
      mensaje: error,
    });
  }
};

cartsCtrls.createTicket = async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await cartModel.findById(cid).populate("products.id_prod");

    if (!cart) {
      return res.status(404).json({ mensaje: "Carrito no encontrado" });
    }

    if (cart.products.length === 0) {
      return res.status(400).json({ mensaje: "El carrito está vacío" });
    }

    let totalAmount = 0;

    // Verificar el stock de cada producto en el carrito
    for (const item of cart.products) {
      const product = item.id_prod;
      const requestedQuantity = item.quantity;

      if (product.stock >= requestedQuantity) {
        // Restar la cantidad del stock del producto
        product.stock -= requestedQuantity;

        let productoQueActualizar = await productModel.findById(product._id);

        if (productoQueActualizar) {
          productoQueActualizar.stock -= requestedQuantity;
          await productoQueActualizar.save();
        } else {
          req.logger.error(
            "No se encontró el producto que quiere actualizar",
            error
          );
        }

        // Precio total del ticket
        const priceProduct = product.price;
        totalAmount += priceProduct * requestedQuantity;
      } else {
        // Si no hay suficiente stock, no agrega el producto al proceso de compra
        return res.status(400).send({
          mensaje: `No hay suficiente stock para el producto: ${product.title}`,
        });
      }
    }

    // Crear ticket
    const newTicket = await Ticket.create({
      amount: totalAmount,
      purchaser: req.user.user.email,
      payment_mp: "No disponible",
      status_mp: "No disponible",
      MerchantOrder_mp: "No disponible",
    });

    // Vaciar carrito
    const emptyCart = await cartModel.findByIdAndUpdate(
      cid,
      { $set: { products: [] } },
      { new: true }
    );

    res.status(200).send({
      mensaje: "Ticket creado exitosamente",
      ticket: newTicket,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: `Error al crear ticket de compra: ${error.message}` });
  }
};

export default cartsCtrls;
