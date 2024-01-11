import { userModel } from "../models/users.models.js";
import { validatePassword } from "../utils/bcrypt.js";

export const validateUpdateForm = async (
  formData,
  authenticatedUserId,
  userId
) => {
  const nameRegex = /^[A-Za-zñÑ\s]+$/;

  if (formData.first_name !== undefined && formData.first_name !== "") {
    const trimmedFirstName = formData.first_name.trim();

    if (!nameRegex.test(trimmedFirstName)) {
      return "El nombre solo pueden contener letras.";
    }
  }

  if (formData.last_name !== undefined && formData.last_name !== "") {
    const trimmedLastName = formData.last_name.trim();
    if (!nameRegex.test(trimmedLastName)) {
      return "El apellido solo pueden contener letras.";
    }
  }

  if (formData.age) {
    const ageValue = parseInt(formData.age, 10);
    if (isNaN(ageValue) || ageValue < 16 || ageValue > 105 || ageValue < 0) {
      return "La edad debe ser un número entre 16 y 105.";
    }
  }

  if (formData.email) {
    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return "El correo electrónico no tiene un formato válido.";
    }
  }

  if (formData.password && userId) {
    const userPassword = await userModel.findById(userId);
    if (validatePassword(formData.password, userPassword.password)) {
      return "La nueva contraseña no puede ser igual a la contraseña actual";
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      return "La contraseña debe tener al menos 6 caracteres, incluir al menos una mayúscula, al menos una minúscula y al menos un número.";
    }
  }

  // Verificar que el usuario autenticado pueda actualizar sus propios datos
  if (authenticatedUserId.toString() !== userId.toString()) {
    return "Acceso no autorizado para actualizar el usuario.";
  }

  // No hay errores
  return null;
};
