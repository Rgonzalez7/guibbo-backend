// server/controllers/adminProfesorController.js
const bcrypt = require("bcryptjs");
const Usuario = require("../models/user");
const Universidad = require("../models/university");
const Materia = require("../models/materia");

/**
 * Helper para encontrar la universidad asociada a un admin/director.
 */
async function findUniversidadForAdmin(adminId) {
  if (!adminId) return null;

  // 1) Intentar leer el usuario y ver si tiene un campo universidad
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
 * Body:
 * - nombres
 * - apellidos
 * - email
 * - password
 * - passwordConfirm
 */
exports.crearProfesorAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;

    const {
      nombres,
      apellidos,
      email,
      password,
      passwordConfirm,
    } = req.body;

    // Validaciones básicas
    if (!nombres || !apellidos || !email) {
      return res.status(400).json({
        message: "Nombre(s), apellido(s) y correo institucional son obligatorios.",
      });
    }

    if (!password || !passwordConfirm) {
      return res.status(400).json({
        message: "La contraseña y la confirmación de contraseña son obligatorias.",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        message: "Las contraseñas no coinciden.",
      });
    }

    // Comprobar si ya existe un usuario con ese correo
    const existing = await Usuario.findOne({ email }).lean();
    if (existing) {
      return res.status(400).json({
        message: "Ya existe un usuario con ese correo electrónico.",
      });
    }

    // Encontrar la universidad asociada al admin/director
    const universidadId = await findUniversidadForAdmin(adminId);

    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. " +
          "Revisa que el director esté vinculado a una universidad.",
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nombre completo
    const nombreCompleto = `${nombres} ${apellidos}`.trim();

    // Crear profesor
    const profesor = await Usuario.create({
      nombre: nombreCompleto,  // nombre completo
      nombres,
      apellidos,
      email,
      password: hashedPassword,
      rol: "profesor",
      universidad: universidadId,
      activo: false,
    });

    return res.status(201).json({
      message: "Profesor creado correctamente.",
      profesor: {
        _id: profesor._id,
        nombre: profesor.nombre,
        nombres: profesor.nombres,
        apellidos: profesor.apellidos,
        email: profesor.email,
        rol: profesor.rol,
        universidad: profesor.universidad,
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

    // 1) Profesores
    const profesores = await Usuario.find({
      rol: "profesor",
      universidad: universidadId, // universidadId es string
    })
      .select("nombre nombres apellidos email rol activo updatedAt createdAt universidad")
      .sort({ createdAt: -1 })
      .lean();

    const profIds = profesores.map((p) => p._id);

    // 2) Materias de esos profesores (solo en la misma universidad)
    const materias = await Materia.find({
      universidad: universidadId,
      profesor: { $in: profIds },
    })
      .select("_id nombre codigo grupo periodoAcademico profesor estudiantes estado createdAt")
      .lean();

    // 3) Mapear por profesor: materiasCount + estudiantesTotal + materias[]
    const map = new Map(); // key: profesorId -> { materiasCount, estudiantesTotal, materias: [] }

    for (const m of materias) {
      const k = String(m.profesor);
      if (!map.has(k)) {
        map.set(k, { materiasCount: 0, estudiantesTotal: 0, materias: [] });
      }
      const acc = map.get(k);

      const totalEstudiantes = Array.isArray(m.estudiantes) ? m.estudiantes.length : 0;

      acc.materiasCount += 1;
      acc.estudiantesTotal += totalEstudiantes;

      // lista ligera (para tooltip / detalle rápido)
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

    // 4) Enriquecer profesores
    const profesoresEnriquecidos = profesores.map((p) => {
      const extra = map.get(String(p._id)) || {
        materiasCount: 0,
        estudiantesTotal: 0,
        materias: [],
      };
      return { ...p, ...extra };
    });

    // 5) Métricas generales (útil para cards)
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
      .select("nombre nombres apellidos email rol activo createdAt updatedAt")
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
 * Actualizar profesor (sin departamento)
 */
exports.actualizarProfesorAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const profesorId = req.params.id;

    const {
      nombres,
      apellidos,
      email,
      password,
      passwordConfirm,
      activo,
    } = req.body;

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
        message:
          "Nombre(s), apellido(s) y correo institucional son obligatorios.",
      });
    }

    const nombreCompleto = `${nombres} ${apellidos}`.trim();

    profesor.nombres = nombres;
    profesor.apellidos = apellidos;
    profesor.nombre = nombreCompleto;
    profesor.email = email;

    // activo opcional
    if (typeof activo !== "undefined") {
      profesor.activo = !!activo;
    }

    // cambio de contraseña opcional
    if (password || passwordConfirm) {
      if (password !== passwordConfirm) {
        return res.status(400).json({
          message: "Si deseas cambiar la contraseña, ambas deben coincidir.",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      profesor.password = hashedPassword;
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

    return res.json({
      message: "Profesor eliminado correctamente.",
    });
  } catch (err) {
    console.error("❌ Error eliminando profesor (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al eliminar el profesor.",
      error: err.message,
    });
  }
};