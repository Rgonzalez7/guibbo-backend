const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

/**
 * Rutas normales
 */
router.post('/register', register);
router.post('/login', login);

/**
 * SEED: crear estudiante de prueba
 * POST /api/auth/seed-estudiante
 */
router.post('/seed-estudiante', async (req, res) => {
  try {
    const email = 'tayron@uni.edu';
    const nombre = 'Tayron Murillo';
    const passwordPlano = '123456';
    const rol = 'estudiante';
    const universidad = 'Universidad Adventista';

    const yaExiste = await User.findOne({ email });
    if (yaExiste) {
      return res.json({
        message: 'Seed ya existe, puedes loguearte',
        user: {
          id: yaExiste._id,
          email: yaExiste.email,
          rol: yaExiste.rol || rol,
          nombre: yaExiste.nombre || nombre,
          universidad: yaExiste.universidad || universidad,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(passwordPlano, 10);

    const nuevo = await User.create({
      email,
      password: hashedPassword,
      nombre,
      rol,
      universidad,
      foto: ''
    });

    res.json({
      message: 'Usuario seed creado',
      user: {
        id: nuevo._id,
        email: nuevo.email,
        rol: nuevo.rol,
        nombre: nuevo.nombre,
        universidad: nuevo.universidad
      }
    });
  } catch (err) {
    console.error('❌ seed-estudiante error:', err);
    res.status(500).json({ message: 'No se pudo crear seed', error: err.message });
  }
});

/**
 * SEED: crear admin de Dirección de Carrera
 * POST /api/auth/seed-admin
 */
router.post('/seed-admin', async (req, res) => {
  try {
    const email = 'admin@guibbo.edu';
    const nombre = 'Admin Güibbo';
    const passwordPlano = 'admin123';
    const rol = 'director';
    const universidad = 'Universidad Adventista';

    // ¿Ya existe?
    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({
        message: 'El usuario admin ya existe',
        user: {
          id: existing._id,
          email: existing.email,
          rol: existing.rol || rol,
          nombre: existing.nombre || nombre,
          universidad: existing.universidad || universidad,
        },
      });
    }

    // Crear nuevo admin
    const hashed = await bcrypt.hash(passwordPlano, 10);

    const newUser = await User.create({
      email,
      password: hashed,
      nombre,
      rol,
      universidad,
      foto: ''
    });

    res.json({
      message: 'Usuario admin creado',
      user: {
        id: newUser._id,
        email: newUser.email,
        rol: newUser.rol,
        nombre: newUser.nombre,
        universidad: newUser.universidad,
      },
    });
  } catch (err) {
    console.error('❌ seed-admin error:', err);
    res.status(500).json({ message: 'Error al crear usuario admin', error: err.message });
  }
});

/**
 * SEED: crear profesor (MSc. Herrera)
 * POST /api/auth/seed-profesor
 */
router.post('/seed-profesor', async (req, res) => {
  try {
    const email = 'herrera@uni.edu';
    const nombre = 'MSc. Herrera';
    const passwordPlano = 'profesor123';
    const rol = 'profesor';
    const universidad = 'Universidad Adventista';

    const existente = await User.findOne({ email });
    if (existente) {
      return res.json({
        message: 'El profesor ya existe, puedes loguearte',
        user: {
          id: existente._id,
          email: existente.email,
          rol: existente.rol || rol,
          nombre: existente.nombre || nombre,
          universidad: existente.universidad || universidad,
        },
      });
    }

    const hashed = await bcrypt.hash(passwordPlano, 10);
    const nuevo = await User.create({
      email,
      password: hashed,
      nombre,
      rol,
      universidad,
      foto: ''
    });

    res.json({
      message: 'Profesor creado correctamente',
      user: {
        id: nuevo._id,
        email: nuevo.email,
        rol: nuevo.rol,
        nombre: nuevo.nombre,
        universidad: nuevo.universidad
      }
    });
  } catch (err) {
    console.error('❌ seed-profesor error:', err);
    res.status(500).json({ message: 'No se pudo crear el profesor', error: err.message });
  }
});

/**
 * SEED: crear SÚPER USUARIO
 * POST /api/auth/seed-super
 */
router.post('/seed-super', async (req, res) => {
  try {
    const email = 'super@guibbo.app';
    const nombre = 'Súper Usuario';
    const passwordPlano = 'super123';
    const rol = 'super';
    // El súper usuario puede no depender de una uni concreta, pero dejamos una etiqueta
    const universidad = 'Global';

    const existente = await User.findOne({ email });
    if (existente) {
      return res.json({
        message: 'El súper usuario ya existe',
        user: {
          id: existente._id,
          email: existente.email,
          rol: existente.rol || rol,
          nombre: existente.nombre || nombre,
          universidad: existente.universidad || universidad,
        },
      });
    }

    const hashed = await bcrypt.hash(passwordPlano, 10);
    const nuevo = await User.create({
      email,
      password: hashed,
      nombre,
      rol,
      universidad,
      foto: ''
    });

    res.json({
      message: 'Súper usuario creado correctamente',
      user: {
        id: nuevo._id,
        email: nuevo.email,
        rol: nuevo.rol,
        nombre: nuevo.nombre,
        universidad: nuevo.universidad
      }
    });
  } catch (err) {
    console.error('❌ seed-super error:', err);
    res.status(500).json({ message: 'No se pudo crear el súper usuario', error: err.message });
  }
});

module.exports = router;