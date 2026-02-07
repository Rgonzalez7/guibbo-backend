const User = require('../models/user');
const Materia = require("../models/materia");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;

    // ¿Existe ya?
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'El usuario ya existe.' });

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creamos el usuario
    const newUser = new User({
      email,
      password: hashedPassword,
      nombre: nombre || '',
      rol: rol || 'estudiante', // si no manda rol, cae como estudiante
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado correctamente.' });
  } catch (err) {
    console.error('❌ register error:', err);
    res.status(500).json({ message: 'Error en el servidor.', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    // Comparar password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta." });

    // fallback para usuarios viejos que no tenían rol
    const rolSeguro = user.rol || "estudiante";

    // ✅ 1) Bloqueo directo por flag
    if (user.activo === false) {
      return res.status(403).json({
        message: "Tu cuenta está desactivada. Contacta al administrador.",
      });
    }

    // ✅ 2) Regla negocio: profesor sin materias NO puede iniciar sesión
    if (rolSeguro === "profesor") {
      const materiasCount = await Materia.countDocuments({
        universidad: String(user.universidad || ""),
        profesor: String(user._id),
      });

      if (!materiasCount || materiasCount <= 0) {
        // sincroniza estado
        if (user.activo !== false) {
          user.activo = false;
          await user.save();
        }

        return res.status(403).json({
          message: "Tu cuenta está desactivada porque no tienes materias asignadas.",
        });
      }
    }

    // ✅ Firmar JWT (solo si pasa reglas)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre || "",
        foto: user.foto || null,
        rol: rolSeguro,
      },
    });
  } catch (err) {
    console.error("❌ login error:", err);
    res.status(500).json({ message: "Error en el servidor.", error: err.message });
  }
};

module.exports = { register, login };