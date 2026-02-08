// server/controllers/authController.js
const User = require("../models/user");
const Materia = require("../models/materia");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendResetPasswordEmail } = require("../utils/mailer");


/* =========================
   Reset token helpers
   ========================= */
function signResetToken(userId) {
  return jwt.sign(
    { id: String(userId), purpose: "reset" },
    process.env.JWT_SECRET,
    { expiresIn: "20m" }
  );
}

function verifyResetToken(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (!payload || payload.purpose !== "reset" || !payload.id) {
    const err = new Error("Token inválido");
    err.status = 400;
    throw err;
  }
  return payload;
}

/* =========================
   Auth
   ========================= */

const register = async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "El usuario ya existe." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      nombre: nombre || "",
      rol: rol || "estudiante",
      debeCambiarPassword: false,
    });

    await newUser.save();

    res.status(201).json({ message: "Usuario registrado correctamente." });
  } catch (err) {
    console.error("❌ register error:", err);
    res.status(500).json({ message: "Error en el servidor.", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta." });

    const rolSeguro = user.rol || "estudiante";

    // 1) bloqueo por flag
    if (user.activo === false) {
      return res.status(403).json({
        message: "Tu cuenta está desactivada. Contacta al administrador.",
      });
    }

    // 2) profesor sin materias => bloquear
    if (rolSeguro === "profesor") {
      const materiasCount = await Materia.countDocuments({
        universidad: String(user.universidad || ""),
        profesor: String(user._id),
      });

      if (!materiasCount || materiasCount <= 0) {
        if (user.activo !== false) {
          user.activo = false;
          await user.save();
        }

        return res.status(403).json({
          message: "Tu cuenta está desactivada porque no tienes materias asignadas.",
        });
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre || "",
        foto: user.foto || null,
        rol: rolSeguro,
        universidad: user.universidad || "",
        debeCambiarPassword: !!user.debeCambiarPassword,
      },
    });
  } catch (err) {
    console.error("❌ login error:", err);
    res.status(500).json({ message: "Error en el servidor.", error: err.message });
  }
};

/**
 * POST /api/auth/recuperar
 * Body: { email }
 * Respuesta neutral SIEMPRE.
 * Envía correo real con botón al link /reset-password?token=...
 */
const recuperar = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "El correo es obligatorio." });

    const neutralMsg =
      "Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.";

    const user = await User.findOne({ email }).lean();
    if (!user) return res.json({ message: neutralMsg });

    const token = signResetToken(user._id);

    const front = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    if (!front) {
      return res.status(500).json({ message: "Falta FRONTEND_URL en el backend." });
    }

    const resetUrl = `${front}/reset-password?token=${encodeURIComponent(token)}`;

    await sendResetPasswordEmail({ to: user.email, resetUrl });

    return res.json({ message: neutralMsg });
  } catch (err) {
    console.error("❌ recuperar error:", err);
    return res.status(500).json({ message: "Error en el servidor.", error: err.message });
  }
};

/**
 * POST /api/auth/primer-cambio
 * Body: { email, passwordActual, passwordNueva, passwordConfirm }
 * Para usuarios con debeCambiarPassword=true (password genérica)
 */
const primerCambio = async (req, res) => {
  try {
    const { email, passwordActual, passwordNueva, passwordConfirm } = req.body;

    if (!email || !passwordActual || !passwordNueva || !passwordConfirm) {
      return res.status(400).json({
        message: "Email, contraseña actual, nueva contraseña y confirmación son obligatorios.",
      });
    }

    if (passwordNueva !== passwordConfirm) {
      return res.status(400).json({ message: "Las contraseñas no coinciden." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    if (!user.debeCambiarPassword) {
      return res.status(400).json({ message: "Tu cuenta no requiere cambio de contraseña inicial." });
    }

    const ok = await bcrypt.compare(passwordActual, user.password);
    if (!ok) return res.status(400).json({ message: "Contraseña genérica incorrecta." });

    user.password = await bcrypt.hash(passwordNueva, 10);
    user.debeCambiarPassword = false;
    if (user.activo === false) user.activo = true;

    await user.save();

    return res.json({ message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });
  } catch (err) {
    console.error("❌ primerCambio error:", err);
    res.status(500).json({ message: "Error en el servidor.", error: err.message });
  }
};

/**
 * POST /api/auth/reset-password
 * Body: { token, passwordNueva, passwordConfirm }
 */
const resetPassword = async (req, res) => {
  try {
    const { token, passwordNueva, passwordConfirm } = req.body;

    if (!token || !passwordNueva || !passwordConfirm) {
      return res.status(400).json({
        message: "Token, nueva contraseña y confirmación son obligatorios.",
      });
    }

    if (passwordNueva !== passwordConfirm) {
      return res.status(400).json({ message: "Las contraseñas no coinciden." });
    }

    let payload;
    try {
      payload = verifyResetToken(token);
    } catch {
      return res.status(400).json({
        message: "El enlace es inválido o expiró. Solicita uno nuevo.",
      });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    user.password = await bcrypt.hash(passwordNueva, 10);
    user.debeCambiarPassword = false;
    if (user.activo === false) user.activo = true;

    await user.save();

    return res.json({ message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });
  } catch (err) {
    console.error("❌ resetPassword error:", err);
    res.status(500).json({ message: "Error en el servidor.", error: err.message });
  }
};

module.exports = { register, login, recuperar, primerCambio, resetPassword };