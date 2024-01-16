import { MercadoPagoConfig, Preference } from "mercadopago";
import "dotenv/config";

export const createOrder = async (req, res) => {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO,
    });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: "Mi producto de prueba",
            quantity: 1,
            unit_price: 2000,
          },
        ],
        back_urls: {
          success: "https://ayjuana.onrender.com/success",
          failure: "https://ayjuana.onrender.com/failure",
          pending: "https://ayjuana.onrender.com/pending",
        },
        notification_url: "https://ayjuana.onrender.com/webhook",
      },
    });
    console.log(result);
    res.send(200).json(result.body.id);
  } catch (error) {
    console.error("Error en la creación del pedido:", error);
    res.status(500).send("Error en la creación del pedido");
  }
};

export const receiveWebhook = async (req, res) => {
  try {
    const payment = req.query;

    if (payment.type === "payment") {
      const data = await PaymentResponse.findById(payment["data.id"]);
      console.log("Detalles del pago:", data);
    }
    res.status(204);
  } catch (error) {
    console.error("Error en el manejo del webhook:", error);
    res.status(500).send("Error en el manejo del webhook");
  }
};
