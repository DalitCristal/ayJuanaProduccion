import { Router } from "express";
import passport from "passport";
import { passportError, authorization } from "../utils/messagesError.js";
import sessionsCtrls from "../controllers/session.controllers.js";

const sessionRouter = Router();

//Iniciar sesión
sessionRouter.post(
  "/api/session/signin",
  passport.authenticate("login"),
  sessionsCtrls.postLogin
);

//Registrarse
sessionRouter.post(
  "/api/session/signup",
  passport.authenticate("register"),
  sessionsCtrls.postSignUp
);

//Cerrar sesión
sessionRouter.get("/api/session/logout", sessionsCtrls.getLogOut);

//Registrarse a través de github
sessionRouter.post(
  "/api/session/github",
  passport.authenticate("github", { scope: [`user:email`] }),
  sessionsCtrls.getGithub
);

//Iniciar sesión a través de github
sessionRouter.get(
  "/api/session/githubCallback",
  passport.authenticate("github"),
  sessionsCtrls.getGithubCallback
);

sessionRouter.get(
  "/api/session/testJWT",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send(req.user);
  }
);

sessionRouter.get(
  "/api/session/current",
  passportError("jwt"),
  authorization(["admin", "premium", "user"]),
  (req, res) => {
    res.send(req.user);
  }
);

export default sessionRouter;
