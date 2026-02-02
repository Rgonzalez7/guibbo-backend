const User = require('../models/user');
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
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    // Comparar password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta.' });

    // Firmar JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // fallback para usuarios viejos que no tenían rol (antes de la migración)
    const rolSeguro = user.rol || 'estudiante';

    // respondemos al frontend LO QUE NECESITA
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre || '', // puede venir vacío si no lo definieron
        foto: user.foto || null,
        rol: rolSeguro,           
      }
    });
  } catch (err) {
    console.error('❌ login error:', err);
    res.status(500).json({ message: 'Error en el servidor.', error: err.message });
  }
};

module.exports = { register, login };