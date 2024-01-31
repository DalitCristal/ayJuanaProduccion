import { userModel } from "../models/users.models.js";
import { encryptPassword, validatePassword } from "../utils/bcrypt.js";
import "dotenv/config";
import nodemailer from "nodemailer";
import { generateEmailToken } from "../utils/emailToken.js";
import jwt from "jsonwebtoken";
import { validateUpdateForm } from "../utils/validateUpdateForm.js";
import uploader from "../utils/uploader.js";
import { HOST, PORT_FRONT } from "../config/config.js";

const usersCtrls = {};

// Buscar todos los usuarios
usersCtrls.getApiAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).send({ respuesta: "OK", mensaje: users });
  } catch (error) {
    res.status(400).send({ respuesta: "Error", mensaje: error });
  }
};

// Buscar un usuario
usersCtrls.getUserById = async (req, res) => {
  const { id } = req.params;
  const authenticatedUserId = req.user.user._id;

  try {
    const user = await userModel.findById(id);
    if (user) {
      if (req.user.user.rol === "admin" || req.user.user.rol === "premium") {
        res.status(200).send({ respuesta: "OK", mensaje: user });
      } else if (authenticatedUserId.toString() === id.toString()) {
        res.status(200).send({ respuesta: "OK", mensaje: user });
      } else {
        res.status(403).send({
          respuesta: "Error",
          mensaje: "Acceso no autorizado",
        });
      }
    } else {
      res
        .status(404)
        .send({ respuesta: "Error", mensaje: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(400).send({ mensaje: "Error", respuesta: error });
  }
};

// Verificar email token
usersCtrls.verifyEmailToken = (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ mensaje: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.EMAIL_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        // Token expirado
        return res.status(403).json({ mensaje: "Token expirado" });
      } else {
        // Error en la verificación
        req.logger.error("Error en la verificación del token:", err);
        return res.status(403).json({ mensaje: "No autorizado" });
      }
    }

    try {
      // Verificar que la acción del token sea la especificada
      if (user.action !== "resetPassword") {
        return res.status(400).json({ mensaje: "Acción no válida" });
      }

      // Validar el tiempo de expiración
      const currentTime = Math.floor(Date.now() / 1000);
      if (user.exp && user.exp < currentTime) {
        return res.status(400).json({ mensaje: "Token expirado" });
      }

      // Validar que el Id del token sea igual al Id de los query params
      const userIdFromToken = user.userId;
      const userIdFromParams = req.params.userId;
      if (userIdFromToken !== userIdFromParams) {
        return res.status(400).json({ mensaje: "Id no válido" });
      }

      res.status(200).json({ mensaje: "Ok", user });
    } catch (error) {
      req.logger.error("Error en la verificación del token:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  });
};

// Editar contraseña
usersCtrls.putPasswordUser = async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;

  // Validar que la nueva contraseña no sea igual a la contraseña actual
  const userPassword = await userModel.findById(userId);

  if (validatePassword(password, userPassword.password)) {
    return res.status(400).json({
      mensaje: "La nueva contraseña no puede ser igual a la contraseña actual",
    });
  }

  const bcryptPassword = encryptPassword(password, process.env.SALT);

  try {
    const user = await userModel.findByIdAndUpdate(userId, {
      password: bcryptPassword,
    });

    if (user) {
      res.clearCookie("token");
      res.status(200).send({
        mensaje: "Contraseña actualizada exitosamente",
        respuesta: user,
      });
    } else {
      res
        .status(404)
        .send({ respuesta: "Error", mensaje: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(400).send({ respuesta: "Error", mensaje: "Token no válido" });
  }
};

// Editar todos los campos de usuario
usersCtrls.putUser = async (req, res) => {
  const { userId } = req.params;
  const authenticatedUserId = req.user.user._id;
  const { first_name, last_name, age, email, password } = req.body;
  const validatedData = { first_name, last_name, age, email, password };

  try {
    const validationError = await validateUpdateForm(
      validatedData,
      authenticatedUserId,
      userId
    );

    if (validationError) {
      return res.status(400).send({
        respuesta: "Error",
        mensaje: validationError,
      });
    }

    const bcryptPassword = password
      ? encryptPassword(password, process.env.SALT)
      : undefined;

    const updateData = password
      ? { ...validatedData, password: bcryptPassword }
      : validatedData;

    const user = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (user) {
      res.status(200).send({
        mensaje: "Usuario actualizado exitosamente",
        respuesta: user,
      });
    } else {
      res.status(500).send({
        respuesta: "Error",
        mensaje: "Error al actualizar el usuario",
      });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Editar rol de usuario
usersCtrls.putRolUser = async (req, res) => {
  const { uid } = req.params;
  const { rol } = req.body;

  try {
    const user = await userModel.findByIdAndUpdate(uid, {
      rol,
    });

    if (user) {
      res.status(200).send({
        mensaje: "Usuario actualizado exitosamente",
        respuesta: user,
      });
    } else {
      res
        .status(404)
        .send({ respuesta: "Error", mensaje: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(400).send({ respuesta: error });
  }
};

let transporterDelete = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "dalitcristal25@gmail.com",
    pass: process.env.CONTRASENA_NODEMAILER,
    authMethod: "DELETE ACCOUNT",
  },
});

usersCtrls.deleteUsers = async (req, res) => {
  try {
    // Verificar si se proporcionaron IDs de usuarios
    const userIds = req.query.userId;
    if (!userIds || userIds.length === 0) {
      return res.status(400).json({
        message: "No se proporcionaron IDs de usuarios para eliminar.",
      });
    }

    // Verificar si el usuario tiene permisos
    if (!req.user.user || req.user.user.rol !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permisos para realizar esta acción." });
    }

    // Buscar los emails antes de que se eliminen las cuentas
    const users = await userModel.find({ _id: { $in: userIds } });
    const userEmails = users.map((user) => user.email);

    // Eliminar los usuarios por sus IDs
    await userModel.deleteMany({
      _id: { $in: userIds },
    });

    // Enviar correos electrónicos
    for (const email of userEmails) {
      const resultado = await transporterDelete.sendMail({
        from: "Ay Juana dalitcristal25@gmail.com",
        to: email,
        subject: "Cuenta inactiva",
        html: `
        <div>
          <h1>Su cuenta ha sido eliminada por inactividad</h1>
          <a href='${HOST}${PORT_FRONT}/'>Ay Juana</a>
        </div>
      `,
      });

      req.logger.info("Correo electrónico enviado con éxito:", resultado);
    }

    res.status(200).send({
      respuesta: "Usuarios eliminados exitosamente.",
      mensaje: "Los usuarios ya fueron notificados vía email",
    });
  } catch (error) {
    req.logger.error("Error al eliminar usuarios:", error);
    res.status(500).json({ message: "Hubo un error al eliminar usuarios." });
  }
};

// Eliminar un usuario
usersCtrls.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userModel.findByIdAndDelete(userId);
    if (user) {
      res.clearCookie("jwtCookie");
      res.status(200).send({ respuesta: "OK", mensaje: user });
    } else {
      res
        .status(404)
        .send({ respuesta: "Error", mensaje: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(400).send({ respuesta: "Error", mensaje: error });
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
    authMethod: "LOGIN",
  },
});

usersCtrls.postMail = async (req, res) => {
  try {
    const { email } = req.body;

    let emailExistente = await userModel.findOne({ email });

    const userId = emailExistente.id;
    const userEmail = emailExistente.email;
    const action = "resetPassword";

    const emailToken = generateEmailToken(userId, userEmail, action);

    if (emailExistente) {
      const resultado = await transporter.sendMail({
        from: "Recuperacion de contraseña dalitcristal25@gmail.com",
        to: userEmail,
        subject: "Recuperación de contraseña",
        html: `
        <div>
          <h1>Recuperación de Contraseña</h1>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href='${HOST}${PORT_FRONT}/edit-profile/${userId}'>Restablecer Contraseña</a>
        </div>
      `,
      });
      req.logger.info("Success:", resultado);
      res
        .status(200)
        .json({ respuesta: "email enviando con exito", mensaje: emailToken });
    } else {
      res.status(404).send({ mensaje: "Usuario No encontrado" });
    }
  } catch (error) {
    req.logger.error("Error:", error);
    res
      .status(500)
      .json({ message: "Ocurrió un error al enviar el correo electrónico." });
  }
};
/* FIN MAIL */

usersCtrls.userDocument = async (req, res) => {
  const files = req.files;
  const { name, reference } = req.body;
  const userId = req.params.uid;

  if (!name || !reference) {
    return res
      .status(400)
      .send({ status: "error", error: "Valores incompletos" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .send({ status: "error", error: "Usuario no encontrado" });
    }

    files.forEach((file) => {
      user.documents.push({ name, reference, file });
    });

    await user.save();

    res.send({ status: "success", payload: user });
  } catch (error) {
    req.logger.error("Error al subir imagenes:", error);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

usersCtrls.uploadProfilePicture = async (req, res) => {
  const file = req.file;
  const userId = req.params.uid;

  if (!file) {
    return res.status(400).send({
      status: "error",
      error: "No se proporcionó una imagen de perfil",
    });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .send({ status: "error", error: "Usuario no encontrado" });
    }

    user.profilePicture = file.filename;

    await user.save();

    res.send({ status: "success", payload: user });
  } catch (error) {
    req.logger.error("Error al subir imagenes:", error);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

export default usersCtrls;
