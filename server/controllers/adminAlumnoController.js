// server/controllers/adminAlumnoController.js
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Usuario = require("../models/user");
const Universidad = require("../models/university");
const { deleteStudentCascade } = require("../utils/deleteStudentCascade");
const { generateGenericPassword } = require("../utils/passwordUtils");

/**
 * Helper: encontrar universidad del usuario (director o profesor)
 */
async function findUniversidadForUser(userId) {
  if (!userId) return null;

  const user = await Usuario.findById(userId).lean().catch(() => null);

  if (user) {
    if (user.universidad) return user.universidad.toString();
    if (user.universidadId) return user.universidadId.toString();
    if (user.university) return user.university.toString();
  }

  const uni =
    (await Universidad.findOne({ directores: userId }).lean().catch(() => null)) ||
    (await Universidad.findOne({ admins: userId }).lean().catch(() => null)) ||
    (await Universidad.findOne({ administradores: userId }).lean().catch(() => null));

  if (uni) return uni._id.toString();

  return null;
}

/**
 * (Compat) Helper antiguo para no romper otras funciones
 */
async function findUniversidadForAdmin(adminId) {
  return await findUniversidadForUser(adminId);
}

/**
 * Crear estudiante como admin/director
 * ✅ Ahora:
 * - Si NO mandas password => genera genérica
 * - debeCambiarPassword = true
 * - devuelve tempPassword para que el admin la copie
 */
exports.crearEstudianteAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;

    const { nombres, apellidos, email, matricula, password, passwordConfirm } =
      req.body;

    if (!nombres || !apellidos || !email || !matricula) {
      return res.status(400).json({
        message:
          "Nombre(s), apellido(s), matrícula y correo institucional son obligatorios.",
      });
    }

    const existingEmail = await Usuario.findOne({ email }).lean();
    if (existingEmail) {
      return res.status(400).json({
        message: "Ya existe un usuario con ese correo electrónico.",
      });
    }

    if (matricula) {
      const existingMat = await Usuario.findOne({ matricula }).lean();
      if (existingMat) {
        return res.status(400).json({
          message: "Ya existe un estudiante con esa matrícula.",
        });
      }
    }

    const universidadId = await findUniversidadForAdmin(adminId);
    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. " +
          "Revisa que el director esté vinculado a una universidad.",
      });
    }

    // ✅ Password: si no viene, generamos una genérica
    let tempPassword = "";
    let finalPassword = password;

    if (!finalPassword) {
      tempPassword = generateGenericPassword(10);
      finalPassword = tempPassword;
    } else {
      // si viene password, validamos si vino confirmación
      if (passwordConfirm && password !== passwordConfirm) {
        return res.status(400).json({ message: "Las contraseñas no coinciden." });
      }
      tempPassword = finalPassword; // para que admin la copie tal cual
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    const nombreCompleto = `${nombres} ${apellidos}`.trim();

    const estudiante = await Usuario.create({
      nombre: nombreCompleto,
      nombres,
      apellidos,
      email,
      matricula,
      password: hashedPassword,
      rol: "estudiante",
      universidad: universidadId,
      activo: true,

      // ✅ obligatorio para forzar cambio al primer login
      debeCambiarPassword: true,
    });

    return res.status(201).json({
      message: "Estudiante creado correctamente.",
      tempPassword,
      estudiante: {
        _id: estudiante._id,
        nombre: estudiante.nombre,
        nombres: estudiante.nombres,
        apellidos: estudiante.apellidos,
        email: estudiante.email,
        matricula: estudiante.matricula,
        rol: estudiante.rol,
        universidad: estudiante.universidad,
        activo: estudiante.activo,
        debeCambiarPassword: !!estudiante.debeCambiarPassword,
      },
    });
  } catch (err) {
    console.error("❌ Error creando estudiante (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al crear el estudiante.",
      error: err.message,
    });
  }
};

/**
 * ✅ Reset password estudiante (admin/director)
 * - genera nueva genérica
 * - debeCambiarPassword = true
 * - devuelve tempPassword
 */
exports.resetPasswordEstudianteAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const estudianteId = req.params.id;

    const universidadId = await findUniversidadForAdmin(adminId);
    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se puede resetear la contraseña.",
      });
    }

    const estudiante = await Usuario.findOne({
      _id: estudianteId,
      rol: "estudiante",
      universidad: universidadId,
    });

    if (!estudiante) {
      return res.status(404).json({
        message: "Estudiante no encontrado en tu universidad.",
      });
    }

    const tempPassword = generateGenericPassword(10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    estudiante.password = hashedPassword;
    estudiante.debeCambiarPassword = true;

    await estudiante.save();

    return res.json({
      message:
        "Contraseña reseteada. Comparte la contraseña genérica con el estudiante (deberá cambiarla al iniciar sesión).",
      tempPassword,
      estudiante: {
        _id: estudiante._id,
        email: estudiante.email,
        nombre: estudiante.nombre,
        rol: estudiante.rol,
        debeCambiarPassword: true,
      },
    });
  } catch (err) {
    console.error("❌ Error reseteando password estudiante (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al resetear la contraseña.",
      error: err.message,
    });
  }
};

/**
 * Listar estudiantes de la universidad del usuario
 * ✅ director y profesor (por rutas)
 */
exports.listarEstudiantesAdmin = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const universidadId = await findUniversidadForUser(userId);

    if (!universidadId) {
      return res.status(400).json({
        message:
          "El usuario no tiene una universidad válida asociada. No se pueden listar estudiantes.",
      });
    }

    const estudiantes = await Usuario.find({
      rol: "estudiante",
      universidad: universidadId,
    })
      .select(
        "nombre nombres apellidos email matricula rol activo debeCambiarPassword updatedAt createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ estudiantes });
  } catch (err) {
    console.error("❌ Error listando estudiantes:", err);
    return res.status(500).json({
      message: "Ocurrió un error al obtener los estudiantes.",
      error: err.message,
    });
  }
};

/**
 * Obtener un estudiante concreto (solo director por rutas)
 */
exports.obtenerEstudianteAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const estudianteId = req.params.id;

    const universidadId = await findUniversidadForAdmin(adminId);

    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se puede obtener el estudiante.",
      });
    }

    const estudiante = await Usuario.findOne({
      _id: estudianteId,
      rol: "estudiante",
      universidad: universidadId,
    })
      .select(
        "nombre nombres apellidos email matricula rol activo debeCambiarPassword createdAt updatedAt"
      )
      .lean();

    if (!estudiante) {
      return res.status(404).json({
        message: "Estudiante no encontrado en tu universidad.",
      });
    }

    return res.json({ estudiante });
  } catch (err) {
    console.error("❌ Error obteniendo estudiante (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al obtener el estudiante.",
      error: err.message,
    });
  }
};

/**
 * Actualizar estudiante (solo director por rutas)
 * ✅ Mantiene cambio de password opcional (manual)
 * Nota: NO fuerza debeCambiarPassword aquí (para eso está resetPassword)
 */
exports.actualizarEstudianteAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const estudianteId = req.params.id;

    const { nombres, apellidos, email, matricula, password, passwordConfirm, activo } =
      req.body;

    const universidadId = await findUniversidadForAdmin(adminId);

    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se puede actualizar el estudiante.",
      });
    }

    const estudiante = await Usuario.findOne({
      _id: estudianteId,
      rol: "estudiante",
      universidad: universidadId,
    });

    if (!estudiante) {
      return res.status(404).json({
        message: "Estudiante no encontrado en tu universidad.",
      });
    }

    if (!nombres || !apellidos || !email || !matricula) {
      return res.status(400).json({
        message:
          "Nombre(s), apellido(s), matrícula y correo institucional son obligatorios.",
      });
    }

    if (matricula && matricula !== estudiante.matricula) {
      const existingMat = await Usuario.findOne({ matricula }).lean();
      if (existingMat) {
        return res.status(400).json({
          message: "Ya existe otro estudiante con esa matrícula.",
        });
      }
    }

    const nombreCompleto = `${nombres} ${apellidos}`.trim();

    estudiante.nombres = nombres;
    estudiante.apellidos = apellidos;
    estudiante.nombre = nombreCompleto;
    estudiante.email = email;
    estudiante.matricula = matricula;

    if (typeof activo !== "undefined") {
      estudiante.activo = !!activo;
    }

    if (password || passwordConfirm) {
      if (password !== passwordConfirm) {
        return res.status(400).json({
          message: "Si deseas cambiar la contraseña, ambas deben coincidir.",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      estudiante.password = hashedPassword;
      // no tocamos debeCambiarPassword aquí
    }

    await estudiante.save();

    return res.json({
      message: "Estudiante actualizado correctamente.",
      estudiante: {
        _id: estudiante._id,
        nombre: estudiante.nombre,
        nombres: estudiante.nombres,
        apellidos: estudiante.apellidos,
        email: estudiante.email,
        matricula: estudiante.matricula,
        rol: estudiante.rol,
        activo: estudiante.activo,
        debeCambiarPassword: !!estudiante.debeCambiarPassword,
      },
    });
  } catch (err) {
    console.error("❌ Error actualizando estudiante (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al actualizar el estudiante.",
      error: err.message,
    });
  }
};

/**
 * Eliminar estudiante (solo director por rutas)
 */
exports.eliminarEstudianteAdmin = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const adminId = req.user?.id || req.user?._id;
    const estudianteId = req.params.id;

    const universidadId = await findUniversidadForAdmin(adminId);

    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se puede eliminar el estudiante.",
      });
    }

    const estudiante = await Usuario.findOne({
      _id: estudianteId,
      rol: "estudiante",
      universidad: universidadId,
    }).lean();

    if (!estudiante) {
      return res.status(404).json({
        message: "Estudiante no encontrado o no pertenece a tu universidad.",
      });
    }

    await session.withTransaction(async () => {
      await deleteStudentCascade(estudianteId, session);

      await Usuario.deleteOne(
        { _id: estudianteId, rol: "estudiante", universidad: universidadId },
        { session }
      );
    });

    return res.json({
      message: "Estudiante eliminado correctamente (instancias eliminadas también).",
    });
  } catch (err) {
    console.error("❌ Error eliminando estudiante (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al eliminar el estudiante.",
      error: err.message,
    });
  } finally {
    session.endSession();
  }
};