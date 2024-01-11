import { Router } from "express";
const loggerRouter = Router();

loggerRouter.get("/loggerRouter/fatal", (req, res) => {
  req.logger.fatal("<span style='color:red'>Texto Fatal</span><br/>");
  res.send("Fatal");
});
loggerRouter.get("/loggerRouter/error", (req, res) => {
  req.logger.error("<span style='color:yellow'>Texto Error</span><br/>");
  res.send("Error");
});
loggerRouter.get("/loggerRouter/info", (req, res) => {
  req.logger.info("<span style='color:blue'>Texto Informativo</span><br/>");
  res.send("Info");
});
loggerRouter.get("/loggerRouter/warning", (req, res) => {
  req.logger.warning("<span style='color:cyan'>Texto Warning</span><br/>");
  res.send("Warning");
});
loggerRouter.get("/loggerRouter/http", (req, res) => {
  req.logger.http("<span style='color:purple'>Texto http</span><br/>");
  res.send("http");
});

export default loggerRouter;
