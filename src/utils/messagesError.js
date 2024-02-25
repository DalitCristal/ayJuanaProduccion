import "dotenv/config";
import passport from "passport";
import jwt from "jsonwebtoken";

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
      // Verificar si el usuario tiene el rol necesario a través de req.user
      if (req.user && roles.includes(req.user.rol)) {
        next(); // El usuario tiene permisos, continúa
      }
      // a través de la cookie jwtCookie
      else if (
        req.cookies.jwtCookie &&
        roles.includes(getUserRolFromToken(req.cookies.jwtCookie))
      ) {
        next();
      }
      // a través del header Authorization
      else if (
        req.headers.authorization &&
        roles.includes(getUserRolFromToken(req.headers.authorization))
      ) {
        next();
      }
      // Usuario no autorizado
      else {
        return res.status(401).send({ error: "Usuario no autorizado" });
      }
    } catch (error) {
      return res.status(500).send({ error: "Error en el servidor" });
    }
  };
};

// Función para obtener el rol del usuario desde el token JWT
const getUserRolFromToken = (jwtCookie) => {
  try {
    // Extraer el token JWT de la cookie
    const token = jwtCookie.split(" ")[1];

    // Decodificar el token JWT para obtener los datos
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Retornar el rol del usuario desde los datos decodificados
    console.log("getUserRolFromToken", decodedToken.user.rol);
    return decodedToken.user.rol;
  } catch (error) {
    // Manejar cualquier error que ocurra al decodificar el token JWT
    console.error("Error al decodificar el token:", error);
    return null;
  }
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
