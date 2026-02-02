// server/middlewares/verifyToken.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    // Soporta "Bearer xxx" o solo "xxx"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader.trim();

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    // 1) Verificar el JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ message: 'Token inválido.' });
    }

    // 2) Cargar el usuario desde la BD
    const user = await User.findById(userId).select(
      'nombre email rol universidad carrera pais foto'
    );

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }

    // 3) Exponer datos al resto de middlewares/controladores
    req.user = user;               // 👈 aquí SI hay .rol
    req.userId = user._id.toString(); // compatibilidad con código viejo
    req.jwtPayload = decoded;      // por si en algún sitio quieres usar el payload crudo

    next();
  } catch (err) {
    console.error('[verifyToken] Token inválido o expirado:', err.message);
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};