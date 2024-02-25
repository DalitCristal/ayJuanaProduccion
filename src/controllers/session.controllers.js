import { userModel } from "../models/users.models.js";
import { generateToken } from "../utils/jwt.js";
import "dotenv/config";

const sessionsCtrls = {};

sessionsCtrls.postLogin = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ mensaje: `Usuario invalido` });
    }

    req.user.last_connection = new Date();
    await req.user.save();

    const token = generateToken(req.user);
    res.cookie("jwtCookie", token, {
      maxAge: 43200000,
    });

    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send({ mensaje: `Error al iniciar sesion ${error}` });
  }
};

sessionsCtrls.postSignUp = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({
        mensaje: "Usuario ya existente",
        respuesta: `${req.user.message}`,
      });
    }
    if (
      !req.user.first_name ||
      !req.user.last_name ||
      !req.user.age ||
      !req.user.email ||
      !req.user.password
    ) {
      return res
        .status(400)
        .send({ mensaje: "Campos de usuario incompletos o inválidos" });
    }

    res.status(201).send({ mensaje: "Usuario registrado" });
  } catch (error) {
    res.status(500).send({ mensaje: `Error al registrar usuario ${error}` });
  }
};

sessionsCtrls.getLogOut = async (req, res) => {
  try {
    // Verificar si el usuario está autenticado
    /* if (!req.user) {
      return res.status(401).send({ mensaje: "Usuario no autenticado" });
    }
    const user = await userModel.findById(req.user.user._id);
 */
    // Actualizar last_connection
    /*  user.last_connection = new Date();
    await user.save(); */

    // Eliminar la cookie de JWT
    res.clearCookie("jwtCookie");

    res.status(200).send({ resultado: "Usuario deslogueado" });
  } catch (error) {
    req.logger.error("Error al cerrar sesión:", error);
    res.status(500).send({ mensaje: "Error al cerrar sesión" });
  }
};

sessionsCtrls.getGithub = async (req, res) => {
  if (req.user) {
    res.status(200).send({ mensaje: "Usuario registrado" });
  } else {
    res.status(401).send({ mensaje: "Error en la autenticación de GitHub" });
  }
};

sessionsCtrls.getGithubCallback = async (req, res) => {
  if (req.user) {
    req.session.user = req.user;
    res.status(200).send({ mensaje: "Usuario logueado" });
  } else {
    res.status(401).send({ mensaje: "Error en la autenticación de GitHub" });
  }
};

export default sessionsCtrls;
