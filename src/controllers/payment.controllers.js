import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import Ticket from "../models/ticket.models.js";
import "dotenv/config";
import nodemailer from "nodemailer";
import { userModel } from "../models/users.models.js";
import { HOST, PORT_FRONT } from "../config/config.js";

// Agregar credenciales
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO,
});

export const createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    const preference = new Preference(client);

    const items = products.map((product) => ({
      id: product.id,
      category_id: product.category,
      description: product.description,
      title: product.title,
      quantity: Number(product.quantity),
      unit_price: Number(product.unit_price),
      currency_id: "ARS",
    }));

    const result = await preference.create({
      body: {
        items: items,
        back_urls: {
          success: `${HOST}${PORT_FRONT}/payment/success`,
          failure: `${HOST}${PORT_FRONT}/payment/failure`,
          pending: `${HOST}${PORT_FRONT}/payment/pending`,
        },
        auto_return: "approved",
      },
    });

    res.status(201).json(result.id);
  } catch (error) {
    req.logger.error("Error en la creación del pedido:", error);
    res.status(500).send("Error en la creación del pedido");
  }
};

export const createTicket = async (req, res) => {
  try {
    const { amount, purchaser, payment_mp, status_mp, MerchantOrder_mp } =
      req.body;

    const existingTicket = await Ticket.findOne({ MerchantOrder_mp });

    if (existingTicket) {
      return res
        .status(400)
        .json({ error: "Ya existe este ticket en la base de datos" });
    }

    // Crear un nuevo ticket
    const newTicket = new Ticket({
      amount,
      purchaser,
      payment_mp,
      status_mp,
      MerchantOrder_mp,
    });

    // Guardar el nuevo ticket
    const savedTicket = await newTicket.save();

    res
      .status(201)
      .send({ respuesta: "Ticket creado con éxito", mensaje: savedTicket });
  } catch (error) {
    req.logger.error("Error al crear el ticket:", error);
    res.status(500).json({ error: "Hubo un error al procesar la solicitud" });
  }
};

/* MAIL */
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "dalitcristal25@gmail.com",
    pass: process.env.CONTRASENA_NODEMAILER,
    authMethod: "PAYMENT SUCCESS",
  },
});

export const postEmailPaymentSuccess = async (req, res) => {
  try {
    const { email } = req.body;
    let emailExistente = await userModel.findOne({ email });

    if (emailExistente) {
      let ticketBDD = await Ticket.findOne({ purchaser: email }).sort({
        purchase_datetime: -1,
      });

      if (ticketBDD) {
        const resultado = await transporter.sendMail({
          from: "Ay Juana",
          to: email,
          subject: "¡Muchas gracias por tu compra!",
          html: `
    <div>
    <h1>TICKET DE COMPRA</h1>
    <h2>Usuario: <strong>${ticketBDD.purchaser}</strong></h2>
    <h2>Código: <strong>${ticketBDD.code}</strong></h2>
    <h2>Hora de creación: <strong>${ticketBDD.purchase_datetime}</strong></h2>
    <h2>Total de la compra: <strong>${ticketBDD.amount}</strong></h2>
    </div>
    `,
        });
        req.logger.info("Success:", resultado);
        res.status(201).send({
          message: "Email enviado con éxito.",
        });
      }
    }
  } catch (error) {
    req.logger.error("Error:", error);
    res
      .status(500)
      .json({ message: "Ocurrió un error al enviar el correo electrónico." });
  }
};
/* FIN MAIL */
