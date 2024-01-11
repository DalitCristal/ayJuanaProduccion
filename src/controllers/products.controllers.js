import { productModel } from "../models/products.models.js";

const productCtrls = {};

productCtrls.getProducts = async (req, res) => {
  try {
    let { category, status, limit, page, sort } = req.query;

    const cat = category;
    const statusProd = status ?? true;
    const limitProd = limit ?? 12;
    const pageProd = page ?? 1;
    const order = sort ?? "asc";
    let productsFromDB;
    let productsToShow;
    let nextPage;
    let prevPage;

    if (cat == undefined) {
      productsFromDB = await productModel.paginate(
        {},
        { limit: limitProd, page: pageProd, sort: { price: order } }
      );
      productsToShow = [];
      for (let prod of productsFromDB.docs) {
        let prodRendered = {
          title: prod.title,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          category: prod.category,
          status: prod.status,
          code: prod.code,
          thumbnails: prod.thumbnails,
          id: prod._id.toString(),
          owner: prod.owner.toString(),
        };
        productsToShow.push(prodRendered);
      }

      if (!productsFromDB.hasPrevPage && productsFromDB.hasNextPage) {
        prevPage = 1;
        nextPage = productsFromDB.nextPage;
      } else if (productsFromDB.hasPrevPage && productsFromDB.hasNextPage) {
        prevPage = productsFromDB.prevPage;
        nextPage = productsFromDB.nextPage;
      } else if (!productsFromDB.hasNextPage) {
        nextPage = productsFromDB.totalPages;
        prevPage = productsFromDB.prevPage;
      }
    } else {
      productsFromDB = await productModel.paginate(
        { category: cat },
        { limit: limitProd, page: pageProd, sort: { price: order } }
      );
      productsToShow = [];
      for (let prod of productsFromDB.docs) {
        let prodRendered = {
          title: prod.title,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          category: prod.category,
          status: prod.status,
          code: prod.code,
          thumbnails: prod.thumbnails,
          id: prod._id.toString(),
          owner: prod.owner.toString(),
        };
        productsToShow.push(prodRendered);
      }
      if (!productsFromDB.hasPrevPage && productsFromDB.hasNextPage) {
        prevPage = 1;
        nextPage = productsFromDB.nextPage;
      } else if (productsFromDB.hasPrevPage && productsFromDB.hasNextPage) {
        prevPage = productsFromDB.prevPage;
        nextPage = productsFromDB.nextPage;
      } else if (!productsFromDB.hasNextPage) {
        nextPage = productsFromDB.totalPages;
        prevPage = productsFromDB.prevPage;
      }
    }

    res.status(200).send({
      respuesta: "OK",
      mensaje: productsToShow,
      next: nextPage,
      prev: prevPage,
    });
  } catch (error) {
    req.logger.error("Error al obtener y procesar los productos:", error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
};

// ------ Buscar producto por ID ------
productCtrls.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const prod = await productModel.findById(id);
    if (prod) {
      res.status(200).send({ respuesta: "OK", mensaje: prod });
    } else {
      res.status(404).send({
        respuesta: "Error en consultar Producto",
        mensaje: "No encontrado",
      });
    }
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en consultar producto", mensaje: error });
  }
};

// ------ Buscar producto por nombre ------
productCtrls.getProductByName = async (req, res) => {
  const { productName } = req.body;

  try {
    const products = await productModel.find({
      title: { $regex: new RegExp(productName, "i") }, // búsqueda insensible a mayúsculas y minúsculas
    });

    if (products.length > 0) {
      res.status(200).send({ status: "OK", data: products });
    } else {
      res.status(404).send({
        status: "Error en consultar Producto",
        message: "No encontrado",
      });
    }
  } catch (error) {
    res
      .status(400)
      .send({ status: "Error en consultar producto", message: error.message });
  }
};

// ------ Crear un nuevo producto ------
productCtrls.postProduct = async (req, res) => {
  const {
    title,
    description,
    price,
    stock,
    category,
    status,
    code,
    thumbnails,
  } = req.body;

  try {
    const userIdFromToken = req.user.user._id;

    const prod = await productModel.create({
      title,
      description,
      price,
      stock,
      category,
      status,
      code,
      thumbnails,
      owner: userIdFromToken,
    });
    res.status(200).send({ respuesta: "OK", mensaje: prod });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en crear producto", mensaje: error });
  }
};

// ------ Actualizar un producto ------
productCtrls.putProduct = async (req, res) => {
  const { productId } = req.params;
  const {
    title,
    description,
    price,
    stock,
    code,
    thumbnails,
    category,
    status,
  } = req.body;

  try {
    // Verificar si el usuario premium tiene los permisos
    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
      return res.status(404).send({
        respuesta: "Error en actualizar producto",
        mensaje: "No encontrado",
      });
    }

    if (
      req.user.user.rol === "premium" &&
      existingProduct.owner.toString() !== req.user.user._id
    ) {
      return res.status(403).send({
        respuesta: "Error en actualizar producto",
        mensaje: "No tienes permisos para editar este producto",
      });
    }

    // Actualizar el producto
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      {
        title,
        description,
        price,
        stock,
        code,
        thumbnails,
        category,
        status,
      },
      { new: true, runValidators: true }
    );

    res.status(200).send({
      respuesta: "Producto actualizado con éxito",
      mensaje: updatedProduct,
    });
  } catch (error) {
    res.status(400).send({
      respuesta: "Error en actualizar un producto",
      mensaje: error.message || error,
    });
  }
};

// ------ Borrar un producto ------
productCtrls.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.user.rol;
  const userIdFromToken = req.user.user._id;

  try {
    let deletedProduct;

    // Verificar si el usuario premium tiene permisos
    const prod = await productModel.findOne({
      _id: id,
      owner: userIdFromToken,
    });

    if (prod) {
      deletedProduct = await productModel.findByIdAndDelete(id);
    } else if (userRole === "admin") {
      deletedProduct = await productModel.findByIdAndDelete(id);
    }

    if (deletedProduct) {
      res.status(200).send({ respuesta: "OK", mensaje: "Producto Borrado" });
    } else {
      res.status(403).send({
        respuesta: "Error en borrar producto",
        mensaje: "No tienes permisos para borrar este producto o no encontrado",
      });
    }
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en borrar producto", mensaje: error });
  }
};

productCtrls.uploadThumbnails = async (req, res) => {
  const files = req.files;
  const productId = req.params.productId;

  if (!files || files.length === 0) {
    return res
      .status(400)
      .send({ status: "error", error: "Tipo de archivo no válido" });
  }

  try {
    const product = await productModel.findById(productId);

    if (!product) {
      return res
        .status(404)
        .send({ status: "error", error: "Producto no encontrado" });
    }

    product.thumbnails = product.thumbnails.concat(
      files.map((file) => file.filename)
    );

    await product.save();

    res.send({ status: "success", payload: product });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

export default productCtrls;
