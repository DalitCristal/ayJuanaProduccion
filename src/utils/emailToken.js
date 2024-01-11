import "dotenv/config";
import jwt from "jsonwebtoken";

export const generateEmailToken = (
  userId,
  userEmail,
  action,
  authorization = "newPassword"
) => {
  const token = jwt.sign(
    { userId, userEmail, action, authorization },
    process.env.EMAIL_SECRET,
    {
      expiresIn: "1h",
    }
  );
  return token;
};
