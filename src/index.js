import "dotenv/config";
import express from "express";
import cors from "cors";
import { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import path from "path";
import router from "./router/index.routes.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "./config/passport.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import { addLogger, logger } from "./config/logger.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import { PORT_BACK, PORT_FRONT, HOST } from "./config/config.js";

const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Documentación de la tienda Ay Juana",
      description: "API AyJuana",
    },
  },
  apis: [`${dirname(fileURLToPath(import.meta.url))}/docs/**/*.yaml`],
};

const specs = swaggerJsdoc(swaggerOptions);

const whiteList = [`${HOST}${PORT_FRONT}`];

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) != -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Acceso denegado"));
    }
  },
  credentials: true,
};

//INICIALIZACION
const app = express();

//BDD
mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    logger.info("BDD is connected");
  })
  .catch((error) => logger.error("Error en conexion a BDD", error));

//SETTINGS
const server = app.listen(PORT_BACK, () => {
  logger.info(`Servidor conectado en Puerto ${PORT_BACK}`);
});

//MIDLEWEARE
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.SIGNED_COOKIE));
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopoLogy: true,
      },
      ttl: 60,
    }),

    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(addLogger);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(
  "/static",
  express.static(path.join(dirname(fileURLToPath(import.meta.url)), "/public"))
);

// Rutas
app.use("/", router);
app.use((req, res) => {
  res.status(404).json({ status: false, errors: "Ruta no encontrada" });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;
