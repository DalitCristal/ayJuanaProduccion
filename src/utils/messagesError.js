import passport from "passport";

// Funcion para retornar errores en las estrategias de passport
export const passportError = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
      if (error) {
        return next(error);
      }
      if (!user) {
        return res
          .status(401)
          .send({ error: info.messages ? info.messages : info.toString() });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};

// Recibo roles y establezco su capacidad
export const authorization = (roles) => {
  return async (req, res, next) => {
    try {
      // Verificar si el usuario está autenticado a través de cookie, headers o user
      if (
        req.cookies.jwtCookie ||
        (req.headers.rol && roles.includes(req.headers.rol)) ||
        (req.user && roles.includes(req.user.rol))
      ) {
        console.log("HEADERS", req.headers);
        console.log("REQ USER", req.user);
        console.log("COOKIE", req.cookies.jwtCookie);

        next(); // El usuario tiene permisos, continúa
      } else {
        // El usuario no tiene el rol necesario, envia un error de autorización

        return res.status(401).send({ error: "Usuario no autorizado" });
      }
    } catch (error) {
      return res.status(500).send({ error: "Error en el servidor" });
    }
  };
};

/* export const authorization = (roles) => {
  return async (req, res, next) => {
     if (!Array.isArray(roles)) {
      roles = [roles];
    }

    if (!roles.includes(req.user.user.rol)) {
      return res
        .status(403)
        .send({ error: "Usuario no tiene los permisos necesarios" });
    }

    next();
  };
} */
