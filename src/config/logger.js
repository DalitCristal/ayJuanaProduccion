import winston from "winston";
import "dotenv/config";

const customLevelOpt = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "yellow",
    warning: "cyan",
    info: "blue",
    http: "magenta",
    debug: "green",
  },
};

// Logger para desarrollo
const developmentLogger = winston.createLogger({
  levels: customLevelOpt.levels,
  transports: [
    new winston.transports.File({
      filename: "./errors.log",
      level: "fatal",
      format: winston.format.combine(winston.format.simple()),
    }),
    new winston.transports.File({
      filename: "./errors.log",
      level: "error",
      format: winston.format.combine(winston.format.simple()),
    }),
    new winston.transports.File({
      filename: "./loggers.log",
      level: "warning",
      format: winston.format.combine(winston.format.simple()),
    }),
    new winston.transports.File({
      filename: "./loggers.log",
      level: "info",
      format: winston.format.combine(winston.format.simple()),
    }),
    new winston.transports.File({
      filename: "./http.log",
      level: "http",
      format: winston.format.combine(winston.format.simple()),
    }),
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelOpt.colors }),
        winston.format.simple()
      ),
    }),
  ],
});

// Logger para producción
const productionLogger = winston.createLogger({
  levels: customLevelOpt.levels,
  transports: [
    new winston.transports.File({
      filename: "./errors.html",
      level: "fatal",
      format: winston.format.combine(winston.format.simple()),
    }),
    new winston.transports.File({
      filename: "./errors.html",
      level: "error",
      format: winston.format.combine(winston.format.simple()),
    }),
    new winston.transports.File({
      filename: "./loggers.html",
      level: "warning",
      format: winston.format.combine(winston.format.simple()),
    }),
    new winston.transports.File({
      filename: "./loggers.html",
      level: "info",
      format: winston.format.combine(winston.format.simple()),
    }),
  ],
});

const logger =
  process.env.MODO_ENV === "production" ? productionLogger : developmentLogger;

export { logger };
export const addLogger = (req, res, next) => {
  (req.logger = logger),
    req.logger.debug(
      `${req.method} es ${req.url} - ${new Date().toLocaleTimeString()} `
    );

  next();
};
