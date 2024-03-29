import "dotenv/config";
import local from "passport-local";
import GithubStrategy from "passport-github2";
import jwt from "passport-jwt";
import passport from "passport";
import { encryptPassword, validatePassword } from "../utils/bcrypt.js";
import { userModel } from "../models/users.models.js";

//Estrategia
const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const initializePassport = () => {
  const cookieExtractor = (req) => {
    const token = req.cookies.jwtCookie || null;

    return token;
  };

  //Token desde Cookie
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwt_payload, done) => {
        //jwt_payload = info del token (en este caso, datos del cliente)
        try {
          return done(null, jwt_payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Registrarse
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, age, email } = req.body;

          const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!validateEmail.test(email)) {
            return done(null, false, {
              message: "Correo electrónico no válido",
            });
          }

          if (password.length < 6) {
            return done(null, false, {
              message: "La contraseña debe tener al menos 6 caracteres",
            });
          }

          const user = await userModel.findOne({ email: email });

          if (user) {
            return done(null, false, { message: "Usuario ya existente" });
          }

          const passwordHash = encryptPassword(password);
          const userCreated = await userModel.create({
            first_name: first_name,
            last_name: last_name,
            age: age,
            email: email,
            password: passwordHash,
          });
          return done(null, userCreated);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Iniciar sesión
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });

          if (!user) {
            return done(null, false, { message: "Usuario no existente" });
          }

          if (password.length < 6) {
            return done(null, false, {
              message: "La contraseña debe tener al menos 6 caracteres",
            });
          }

          if (validatePassword(password, user.password)) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Contraseña incorrecta" });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Registrarse con github
  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({ email: profile._json.email });
          if (user) {
            done(null, false);
          } else {
            const userCreated = await userModel.create({
              first_name: profile._json.name,
              last_name: " ",
              email: profile._json.email,
              age: 18,
              password: encryptPassword(
                profile._json.email + profile._json.name
              ),
            });
            done(null, userCreated);
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );

  // Inicializar la sesión del usuario
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Eliminar la sesión del usuario
  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
};

export default initializePassport;
