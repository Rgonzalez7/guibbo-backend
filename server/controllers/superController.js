// server/controllers/superController.js
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const University = require('../models/university');
const { deleteStudentCascade } = require("../utils/deleteStudentCascade");

/* ===========================
   UNIVERSIDADES
   =========================== */

exports.crearUniversidad = async (req, res) => {
  try {
    const { nombre, codigo, pais, ciudad, pago } = req.body;

    if (!nombre || !codigo) {
      return res.status(400).json({
        message: 'Nombre y código son obligatorios.',
      });
    }

    const yaExiste = await University.findOne({ codigo });
    if (yaExiste) {
      return res.status(400).json({
        message: 'Ya existe una universidad con ese código.',
      });
    }

    const uni = await University.create({
      nombre,
      codigo,
      pais: pais || '',
      ciudad: ciudad || '',
      pago: pago || 'pendiente',
    });

    res.status(201).json({
      message: 'Universidad creada correctamente',
      universidad: uni,
    });
  } catch (err) {
    console.error('❌ Error creando universidad:', err);
    res
      .status(500)
      .json({ message: 'Error al crear universidad', error: err.message });
  }
};

exports.listarUniversidades = async (req, res) => {
  try {
    const universidades = await University.find().sort({ createdAt: -1 });

    const resultado = await Promise.all(
      universidades.map(async (u) => {
        const admins = await User.countDocuments({
          rol: 'director',
          universidad: u.nombre,
        });
        const profesores = await User.countDocuments({
          rol: 'profesor',
          universidad: u.nombre,
        });
        const estudiantes = await User.countDocuments({
          rol: 'estudiante',
          universidad: u.nombre,
        });

        return {
          id: u._id,
          nombre: u.nombre,
          codigo: u.codigo,
          pais: u.pais,
          ciudad: u.ciudad,
          pago: u.pago,
          admins,
          profesores,
          estudiantes,
        };
      })
    );

    res.json({ universidades: resultado });
  } catch (err) {
    console.error('❌ Error listando universidades:', err);
    res.status(500).json({
      message: 'Error al obtener universidades',
      error: err.message,
    });
  }
};

exports.obtenerUniversidad = async (req, res) => {
  try {
    const { id } = req.params;
    const uni = await University.findById(id);
    if (!uni) {
      return res.status(404).json({ message: 'Universidad no encontrada' });
    }
    res.json({ universidad: uni });
  } catch (err) {
    console.error('❌ Error obteniendo universidad:', err);
    res.status(500).json({
      message: 'Error al obtener universidad',
      error: err.message,
    });
  }
};

exports.actualizarUniversidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, pais, ciudad, pago } = req.body;

    if (!nombre || !codigo) {
      return res.status(400).json({
        message: 'Nombre y código son obligatorios.',
      });
    }

    const uni = await University.findById(id);
    if (!uni) {
      return res.status(404).json({ message: 'Universidad no encontrada' });
    }

    const conflictoCodigo = await University.findOne({
      codigo,
      _id: { $ne: id },
    });
    if (conflictoCodigo) {
      return res.status(400).json({
        message: 'Ya existe otra universidad con ese código.',
      });
    }

    uni.nombre = nombre;
    uni.codigo = codigo;
    uni.pais = pais || '';
    uni.ciudad = ciudad || '';
    uni.pago = pago || uni.pago;

    await uni.save();

    res.json({
      message: 'Universidad actualizada correctamente',
      universidad: uni,
    });
  } catch (err) {
    console.error('❌ Error actualizando universidad:', err);
    res.status(500).json({
      message: 'Error al actualizar universidad',
      error: err.message,
    });
  }
};

exports.eliminarUniversidad = async (req, res) => {
  try {
    const { id } = req.params;

    const uni = await University.findById(id);
    if (!uni) {
      return res.status(404).json({ message: 'Universidad no encontrada' });
    }

    await University.findByIdAndDelete(id);

    res.json({ message: 'Universidad eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error eliminando universidad:', err);
    res.status(500).json({
      message: 'Error al eliminar universidad',
      error: err.message,
    });
  }
};

/* ===========================
   HELPER: crear usuario según rol
   =========================== */

async function crearUsuarioConRol(req, res, rolEsperado) {
  try {
    const {
      nombre,
      correo,
      universidad, // string: nombre de la universidad
      carrera,
      pais,
      password,
    } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        message: 'Nombre, correo y contraseña son obligatorios.',
      });
    }

    const emailNormalizado = correo.toLowerCase().trim();

    const yaExiste = await User.findOne({ email: emailNormalizado });
    if (yaExiste) {
      return res
        .status(400)
        .json({ message: 'Ya existe un usuario con ese correo.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const nuevo = await User.create({
      nombre,
      email: emailNormalizado,
      password: hashed,
      rol: rolEsperado,
      universidad: universidad || '',
      carrera: rolEsperado === 'estudiante' ? carrera || '' : '',
      pais: pais || '',
      foto: '',
    });

    res.status(201).json({
      message: 'Usuario creado correctamente',
      user: {
        id: nuevo._id,
        nombre: nuevo.nombre,
        email: nuevo.email,
        rol: nuevo.rol,
        universidad: nuevo.universidad,
        carrera: nuevo.carrera,
        pais: nuevo.pais,
      },
    });
  } catch (err) {
    console.error('❌ Error creando usuario:', err);
    res
      .status(500)
      .json({ message: 'Error al crear usuario', error: err.message });
  }
}

/* ===========================
   CREACIÓN DE USUARIOS POR ROL
   =========================== */

exports.crearAdminCarrera = (req, res) => {
  return crearUsuarioConRol(req, res, 'director');
};

exports.crearProfesor = (req, res) => {
  return crearUsuarioConRol(req, res, 'profesor');
};

exports.crearEstudiante = (req, res) => {
  return crearUsuarioConRol(req, res, 'estudiante');
};

/* ===========================
   OBTENER / ACTUALIZAR USUARIO
   =========================== */

exports.obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.email,
        rol: usuario.rol,
        universidad: usuario.universidad,
        carrera: usuario.carrera,
        pais: usuario.pais,
      },
    });
  } catch (err) {
    console.error('❌ Error obteniendo usuario:', err);
    res.status(500).json({
      message: 'Error al obtener usuario',
      error: err.message,
    });
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      correo,
      universidad,
      carrera,
      pais,
      password,
    } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({
        message: 'Nombre y correo son obligatorios.',
      });
    }

    const emailNormalizado = correo.toLowerCase().trim();

    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (usuario.email !== emailNormalizado) {
      const yaExiste = await User.findOne({ email: emailNormalizado });
      if (yaExiste) {
        return res
          .status(400)
          .json({ message: 'Ya existe un usuario con ese correo.' });
      }
    }

    usuario.nombre = nombre;
    usuario.email = emailNormalizado;
    usuario.universidad = universidad || '';
    usuario.pais = pais || '';

    if (usuario.rol === 'estudiante') {
      usuario.carrera = carrera || '';
    }

    if (password && password.trim() !== '') {
      const hashed = await bcrypt.hash(password, 10);
      usuario.password = hashed;
    }

    await usuario.save();

    res.json({
      message: 'Usuario actualizado correctamente',
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        universidad: usuario.universidad,
        carrera: usuario.carrera,
        pais: usuario.pais,
      },
    });
  } catch (err) {
    console.error('❌ Error actualizando usuario:', err);
    res.status(500).json({
      message: 'Error al actualizar usuario',
      error: err.message,
    });
  }
};

/* ===========================
   ELIMINAR USUARIO (GENÉRICO) + CASCADE SI ES ESTUDIANTE
   =========================== */
   
   exports.eliminarUsuario = async (req, res) => {
     const session = await mongoose.startSession();
   
     try {
       const { id } = req.params;
   
       const usuario = await User.findById(id).lean();
       if (!usuario) {
         return res.status(404).json({ message: "Usuario no encontrado" });
       }
   
       await session.withTransaction(async () => {
         // Si es estudiante => borrar instancias asociadas
         if (usuario.rol === "estudiante") {
           await deleteStudentCascade(id, session);
         }
   
         await User.deleteOne({ _id: id }, { session });
       });
   
       res.json({ message: "Usuario eliminado correctamente" });
     } catch (err) {
       console.error("❌ Error eliminando usuario:", err);
       res.status(500).json({
         message: "Error al eliminar usuario",
         error: err.message,
       });
     } finally {
       session.endSession();
     }
   };

/* ===========================
   LISTADOS DE USUARIOS POR ROL
   =========================== */

exports.listarAdminsCarrera = async (req, res) => {
  try {
    const admins = await User.find({ rol: 'director' })
      .sort({ createdAt: -1 })
      .select('nombre email universidad pais');

    res.json({ admins });
  } catch (err) {
    console.error('❌ Error listando admins carrera:', err);
    res.status(500).json({
      message: 'Error al obtener admins de carrera',
      error: err.message,
    });
  }
};

exports.listarProfesores = async (req, res) => {
  try {
    const profesores = await User.find({ rol: 'profesor' })
      .sort({ createdAt: -1 })
      .select('nombre email universidad pais');

    res.json({ profesores });
  } catch (err) {
    console.error('❌ Error listando profesores:', err);
    res.status(500).json({
      message: 'Error al obtener profesores',
      error: err.message,
    });
  }
};

exports.listarEstudiantes = async (req, res) => {
  try {
    const estudiantes = await User.find({ rol: 'estudiante' })
      .sort({ createdAt: -1 })
      .select('nombre email universidad carrera pais');

    res.json({ estudiantes });
  } catch (err) {
    console.error('❌ Error listando estudiantes:', err);
    res.status(500).json({
      message: 'Error al obtener estudiantes',
      error: err.message,
    });
  }
};

/* ===========================
   RESUMEN PARA DASHBOARD
   =========================== */

exports.resumenDashboard = async (req, res) => {
  try {
    const universidades = await University.countDocuments();
    const admins = await User.countDocuments({ rol: 'director' });
    const profesores = await User.countDocuments({ rol: 'profesor' });
    const estudiantes = await User.countDocuments({ rol: 'estudiante' });

    const ultimas = await University.find()
      .sort({ createdAt: -1 })
      .limit(3);

    const ultimasUniversidades = await Promise.all(
      ultimas.map(async (u) => {
        const adminsUni = await User.countDocuments({
          rol: 'director',
          universidad: u.nombre,
        });
        const profesoresUni = await User.countDocuments({
          rol: 'profesor',
          universidad: u.nombre,
        });
        const estudiantesUni = await User.countDocuments({
          rol: 'estudiante',
          universidad: u.nombre,
        });

        return {
          id: u._id,
          nombre: u.nombre,
          codigo: u.codigo,
          pais: u.pais,
          admins: adminsUni,
          profesores: profesoresUni,
          estudiantes: estudiantesUni,
        };
      })
    );

    const ultimosUsuarios = await User.find({
      rol: { $in: ['director', 'profesor', 'estudiante'] },
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('nombre email rol universidad');

    res.json({
      resumen: {
        universidades,
        admins,
        profesores,
        estudiantes,
      },
      ultimasUniversidades,
      ultimosUsuarios,
    });
  } catch (err) {
    console.error('❌ Error en resumen-dashboard:', err);
    res.status(500).json({
      message: 'Error al obtener resumen',
      error: err.message,
    });
  }
};