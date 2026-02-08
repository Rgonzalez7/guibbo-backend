// server/controllers/adminProfesorController.js
const bcrypt = require("bcryptjs");
const Usuario = require("../models/user");
const Universidad = require("../models/university");
const Materia = require("../models/materia");
const { generateGenericPassword } = require("../utils/passwordUtils");

/**
 * Helper para encontrar la universidad asociada a un admin/director.
 */
async function findUniversidadForAdmin(adminId) {
  if (!adminId) return null;

  const admin = await Usuario.findById(adminId).lean().catch(() => null);

  if (admin) {
    if (admin.universidad) return String(admin.universidad);
    if (admin.universidadId) return String(admin.universidadId);
    if (admin.university) return String(admin.university);
  }

  let uni =
    (await Universidad.findOne({ directores: adminId }).lean().catch(() => null)) ||
    (await Universidad.findOne({ admins: adminId }).lean().catch(() => null)) ||
    (await Universidad.findOne({ administradores: adminId }).lean().catch(() => null));

  if (uni) return String(uni._id);

  return null;
}

/**
 * Crear profesor como admin/director
 * ✅ Ahora:
 * - Si NO mandas password => genera genérica
 * - debeCambiarPassword = true
 * - devuelve tempPassword para que el admin la copie
 */
exports.crearProfesorAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;

    const { nombres, apellidos, email, password, passwordConfirm } = req.body;

    if (!nombres || !apellidos || !email) {
      return res.status(400).json({
        message: "Nombre(s), apellido(s) y correo institucional son obligatorios.",
      });
    }

    const existing = await Usuario.findOne({ email }).lean();
    if (existing) {
      return res.status(400).json({
        message: "Ya existe un usuario con ese correo electrónico.",
      });
    }

    const universidadId = await findUniversidadForAdmin(adminId);
    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. " +
          "Revisa que el director esté vinculado a una universidad.",
      });
    }

    // ✅ Password genérica si no viene
    let tempPassword = "";
    let finalPassword = password;

    if (!finalPassword) {
      tempPassword = generateGenericPassword(10);
      finalPassword = tempPassword;
    } else {
      if (passwordConfirm && password !== passwordConfirm) {
        return res.status(400).json({ message: "Las contraseñas no coinciden." });
      }
      tempPassword = finalPassword;
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    const nombreCompleto = `${nombres} ${apellidos}`.trim();

    const profesor = await Usuario.create({
      nombre: nombreCompleto,
      nombres,
      apellidos,
      email,
      password: hashedPassword,
      rol: "profesor",
      universidad: universidadId,

      // ✅ Lo dejo true: tu regla de materias lo bloqueará si no tiene materias
      activo: true,

      // ✅ forzar cambio
      debeCambiarPassword: true,
    });

    return res.status(201).json({
      message: "Profesor creado correctamente.",
      tempPassword,
      profesor: {
        _id: profesor._id,
        nombre: profesor.nombre,
        nombres: profesor.nombres,
        apellidos: profesor.apellidos,
        email: profesor.email,
        rol: profesor.rol,
        universidad: profesor.universidad,
        activo: profesor.activo,
        debeCambiarPassword: !!profesor.debeCambiarPassword,
      },
    });
  } catch (err) {
    console.error("❌ Error creando profesor (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al crear el profesor.",
      error: err.message,
    });
  }
};

/**
 * ✅ Reset password profesor (admin/director)
 * - genera nueva genérica
 * - debeCambiarPassword = true
 * - devuelve tempPassword
 */
exports.resetPasswordProfesorAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const profesorId = req.params.id;

    const universidadId = await findUniversidadForAdmin(adminId);
    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se puede resetear la contraseña.",
      });
    }

    const profesor = await Usuario.findOne({
      _id: profesorId,
      rol: "profesor",
      universidad: universidadId,
    });

    if (!profesor) {
      return res.status(404).json({
        message: "Profesor no encontrado en tu universidad.",
      });
    }

    const tempPassword = generateGenericPassword(10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    profesor.password = hashedPassword;
    profesor.debeCambiarPassword = true;

    await profesor.save();

    return res.json({
      message:
        "Contraseña reseteada. Comparte la contraseña genérica con el profesor (deberá cambiarla al iniciar sesión).",
      tempPassword,
      profesor: {
        _id: profesor._id,
        email: profesor.email,
        nombre: profesor.nombre,
        rol: profesor.rol,
        debeCambiarPassword: true,
      },
    });
  } catch (err) {
    console.error("❌ Error reseteando password profesor (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al resetear la contraseña.",
      error: err.message,
    });
  }
};

/**
 * Listar profesores de la universidad del admin
 */
exports.listarProfesoresAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;

    const universidadId = await findUniversidadForAdmin(adminId);

    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se pueden listar profesores.",
      });
    }

    const profesores = await Usuario.find({
      rol: "profesor",
      universidad: universidadId,
    })
      .select(
        "nombre nombres apellidos email rol activo debeCambiarPassword updatedAt createdAt universidad"
      )
      .sort({ createdAt: -1 })
      .lean();

    const profIds = profesores.map((p) => p._id);

    const materias = await Materia.find({
      universidad: universidadId,
      profesor: { $in: profIds },
    })
      .select("_id nombre codigo grupo periodoAcademico profesor estudiantes estado createdAt")
      .lean();

    const map = new Map();

    for (const m of materias) {
      const k = String(m.profesor);
      if (!map.has(k)) {
        map.set(k, { materiasCount: 0, estudiantesTotal: 0, materias: [] });
      }
      const acc = map.get(k);

      const totalEstudiantes = Array.isArray(m.estudiantes) ? m.estudiantes.length : 0;

      acc.materiasCount += 1;
      acc.estudiantesTotal += totalEstudiantes;

      acc.materias.push({
        _id: m._id,
        nombre: m.nombre,
        codigo: m.codigo || "",
        grupo: m.grupo || "",
        periodoAcademico: m.periodoAcademico || "",
        estado: m.estado || "activo",
        totalEstudiantes,
      });
    }

    const profesoresEnriquecidos = profesores.map((p) => {
      const extra = map.get(String(p._id)) || {
        materiasCount: 0,
        estudiantesTotal: 0,
        materias: [],
      };
      return { ...p, ...extra };
    });

    const materiasImpartidasTotal = materias.length;
    const estudiantesTotales = materias.reduce((sum, m) => {
      const c = Array.isArray(m.estudiantes) ? m.estudiantes.length : 0;
      return sum + c;
    }, 0);

    return res.json({
      profesores: profesoresEnriquecidos,
      metrics: {
        materiasImpartidasTotal,
        estudiantesTotales,
      },
    });
  } catch (err) {
    console.error("❌ Error listando profesores (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al obtener los profesores.",
      error: err.message,
    });
  }
};

/**
 * Obtener un profesor concreto de la universidad del admin
 */
exports.obtenerProfesorAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const profesorId = req.params.id;

    const universidadId = await findUniversidadForAdmin(adminId);

    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se puede obtener el profesor.",
      });
    }

    const profesor = await Usuario.findOne({
      _id: profesorId,
      rol: "profesor",
      universidad: universidadId,
    })
      .select("nombre nombres apellidos email rol activo debeCambiarPassword createdAt updatedAt")
      .lean();

    if (!profesor) {
      return res.status(404).json({
        message: "Profesor no encontrado en tu universidad.",
      });
    }

    return res.json({ profesor });
  } catch (err) {
    console.error("❌ Error obteniendo profesor (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al obtener el profesor.",
      error: err.message,
    });
  }
};

/**
 * Actualizar profesor
 * ✅ cambio de contraseña opcional (manual), NO fuerza debeCambiarPassword
 */
exports.actualizarProfesorAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const profesorId = req.params.id;

    const { nombres, apellidos, email, password, passwordConfirm, activo } = req.body;

    const universidadId = await findUniversidadForAdmin(adminId);

    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se puede actualizar el profesor.",
      });
    }

    const profesor = await Usuario.findOne({
      _id: profesorId,
      rol: "profesor",
      universidad: universidadId,
    });

    if (!profesor) {
      return res.status(404).json({
        message: "Profesor no encontrado en tu universidad.",
      });
    }

    if (!nombres || !apellidos || !email) {
      return res.status(400).json({
        message: "Nombre(s), apellido(s) y correo institucional son obligatorios.",
      });
    }

    const nombreCompleto = `${nombres} ${apellidos}`.trim();

    profesor.nombres = nombres;
    profesor.apellidos = apellidos;
    profesor.nombre = nombreCompleto;
    profesor.email = email;

    if (typeof activo !== "undefined") {
      profesor.activo = !!activo;
    }

    if (password || passwordConfirm) {
      if (password !== passwordConfirm) {
        return res.status(400).json({
          message: "Si deseas cambiar la contraseña, ambas deben coincidir.",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      profesor.password = hashedPassword;
      // no tocamos debeCambiarPassword aquí
    }

    await profesor.save();

    return res.json({
      message: "Profesor actualizado correctamente.",
      profesor: {
        _id: profesor._id,
        nombre: profesor.nombre,
        nombres: profesor.nombres,
        apellidos: profesor.apellidos,
        email: profesor.email,
        rol: profesor.rol,
        activo: profesor.activo,
        debeCambiarPassword: !!profesor.debeCambiarPassword,
      },
    });
  } catch (err) {
    console.error("❌ Error actualizando profesor (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al actualizar el profesor.",
      error: err.message,
    });
  }
};

/**
 * Eliminar profesor
 */
exports.eliminarProfesorAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const profesorId = req.params.id;

    const universidadId = await findUniversidadForAdmin(adminId);

    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se puede eliminar el profesor.",
      });
    }

    const profesor = await Usuario.findOneAndDelete({
      _id: profesorId,
      rol: "profesor",
      universidad: universidadId,
    });

    if (!profesor) {
      return res.status(404).json({
        message: "Profesor no encontrado o no pertenece a tu universidad.",
      });
    }

    return res.json({ message: "Profesor eliminado correctamente." });
  } catch (err) {
    console.error("❌ Error eliminando profesor (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al eliminar el profesor.",
      error: err.message,
    });
  }
};