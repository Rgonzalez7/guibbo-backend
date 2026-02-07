// server/controllers/adminMateriaController.js
const Usuario = require("../models/user");
const Universidad = require("../models/university");
const Materia = require("../models/materia");
const { Modulo } = require("../models/modulo");
const ModuloInstancia = require("../models/moduloInstancia");
const EjercicioInstancia = require("../models/ejercicioInstancia");
const { Submodulo, Ejercicio } = require("../models/modulo");

/**
 * Helper: encontrar universidad del usuario (director o profesor)
 * - Si el usuario tiene universidad en el doc → se usa eso (sirve para profesor)
 * - Si es director y no tiene universidad, fallback a Universidad.directores/admins/etc
 */
async function findUniversidadForUser(userId) {
  if (!userId) return null;

  const user = await Usuario.findById(userId).lean().catch(() => null);

  if (user) {
    if (user.universidad) return user.universidad.toString();
    if (user.universidadId) return user.universidadId.toString();
    if (user.university) return user.university.toString();
  }

  // fallback SOLO para directores/admins “linkeados” en Universidad
  const uni =
    (await Universidad.findOne({ directores: userId }).lean().catch(() => null)) ||
    (await Universidad.findOne({ admins: userId }).lean().catch(() => null)) ||
    (await Universidad.findOne({ administradores: userId }).lean().catch(() => null));

  if (uni) return uni._id.toString();

  return null;
}

/**
 * (Compat) Helper antiguo: mantener por si hay otras funciones que lo llaman
 * Internamente usa findUniversidadForUser.
 */
async function findUniversidadForAdmin(adminId) {
  return await findUniversidadForUser(adminId);
}

/**
 * Crear materia como admin/director
 */
exports.crearMateriaAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;

    const {
      nombre,
      codigo,
      grupo,
      periodoAcademico,
      profesorId,
      aula,
      semestre,
      creditos,
      horario,
    } = req.body;

    if (!nombre || !profesorId) {
      return res.status(400).json({
        message: "El nombre de la materia y el profesor responsable son obligatorios.",
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

    const profesor = await Usuario.findOne({
      _id: profesorId,
      rol: "profesor",
      universidad: universidadId,
    }).lean();

    if (!profesor) {
      return res.status(400).json({
        message:
          "El profesor seleccionado no existe o no pertenece a tu universidad.",
      });
    }

    const materia = await Materia.create({
      nombre,
      codigo,
      grupo,
      periodoAcademico,
      profesor: profesor._id,
      profesorNombre:
        profesor.nombre ||
        `${profesor.nombres || ""} ${profesor.apellidos || ""}`.trim(),
      profesorEmail: profesor.email,
      universidad: universidadId,
      aula: aula || "",
      semestre: semestre || "",
      creditos: creditos || 0,
      horario: horario || "",
      estado: "activo",
    });

    await Usuario.updateOne(
      { _id: profesor._id, rol: "profesor" },
      { $set: { activo: true } }
    );

    return res.status(201).json({
      message: "Materia creada correctamente.",
      materia,
    });
  } catch (err) {
    console.error("❌ Error creando materia (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al crear la materia.",
      error: err.message,
    });
  }
};

/**
 * Listar materias del admin
 */
exports.listarMateriasAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const universidadId = await findUniversidadForAdmin(adminId);

    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se pueden listar materias.",
      });
    }

    const materias = await Materia.find({
      universidad: universidadId,
    })
      .populate({ path: "profesor", select: "nombre nombres apellidos email" })
      .sort({ createdAt: -1 })
      .lean();

    const materiasNormalizadas = materias.map((m) => {
      let profNombre =
        m.profesorNombre ||
        (m.profesor?.nombre ||
          `${m.profesor?.nombres || ""} ${m.profesor?.apellidos || ""}`.trim());

      let profEmail = m.profesorEmail || m.profesor?.email || "";

      return {
        ...m,
        profesorNombre: profNombre,
        profesorEmail: profEmail,
        totalEstudiantes: (m.estudiantes || []).length,
      };
    });

    return res.json({ materias: materiasNormalizadas });
  } catch (err) {
    console.error("❌ Error listando materias (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al obtener las materias.",
      error: err.message,
    });
  }
};

/**
 * Obtener una materia
 * ✅ Director puede ver cualquier materia de su universidad
 * ✅ Profesor SOLO puede ver si es el profesor asignado a esa materia
 */
exports.obtenerMateriaAdmin = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const materiaId = req.params.id;

    const universidadId = await findUniversidadForUser(userId);
    if (!universidadId) {
      return res.status(400).json({
        message:
          "El usuario no tiene una universidad válida asociada. No se puede obtener la materia.",
      });
    }

    const materia = await Materia.findOne({
      _id: materiaId,
      universidad: universidadId,
    })
      .populate({ path: "profesor", select: "nombre nombres apellidos email _id" })
      .populate({
        path: "estudiantes",
        select: "nombre nombres apellidos email matricula",
      })
      .lean();

    if (!materia) {
      return res.status(404).json({
        message: "Materia no encontrada en tu universidad.",
      });
    }

    // ✅ Si es profesor, validar que sea SU materia
    if (req.user?.rol === "profesor") {
      const materiaProfesorId = String(materia.profesor?._id || materia.profesor);
      if (materiaProfesorId !== String(userId)) {
        return res.status(403).json({
          message: "Acceso denegado. Esta materia no está asignada a este profesor.",
        });
      }
    }

    return res.json({ materia });
  } catch (err) {
    console.error("❌ Error obteniendo materia (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al obtener la materia.",
      error: err.message,
    });
  }
};

/**
 * Actualizar materia (sin tocar módulos ni estudiantes aquí)
 */
exports.actualizarMateriaAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const materiaId = req.params.id;

    const {
      nombre,
      codigo,
      grupo,
      periodoAcademico,
      profesorId,
      aula,
      semestre,
      creditos,
      horario,
      estado,
    } = req.body;

    const universidadId = await findUniversidadForAdmin(adminId);
    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se puede actualizar la materia.",
      });
    }

    const materia = await Materia.findOne({
      _id: materiaId,
      universidad: universidadId,
    });

    if (!materia) {
      return res.status(404).json({
        message: "Materia no encontrada en tu universidad.",
      });
    }

    if (!nombre || !profesorId) {
      return res.status(400).json({
        message:
          "El nombre de la materia y el profesor responsable son obligatorios.",
      });
    }

    const profesor = await Usuario.findOne({
      _id: profesorId,
      rol: "profesor",
      universidad: universidadId,
    }).lean();

    if (!profesor) {
      return res.status(400).json({
        message:
          "El profesor seleccionado no existe o no pertenece a tu universidad.",
      });
    }

    materia.nombre = nombre;
    materia.codigo = codigo || "";
    materia.grupo = grupo || "";
    materia.periodoAcademico = periodoAcademico || "";
    materia.profesor = profesor._id;
    materia.profesorNombre =
      profesor.nombre || `${profesor.nombres || ""} ${profesor.apellidos || ""}`.trim();
    materia.profesorEmail = profesor.email;
    materia.aula = aula || "";
    materia.semestre = semestre || "";
    materia.creditos = creditos || 0;
    materia.horario = horario || "";

    if (estado) {
      materia.estado = estado;
    }

    await Usuario.updateOne(
      { _id: profesor._id, rol: "profesor" },
      { $set: { activo: true } }
    );

    await materia.save();

    return res.json({
      message: "Materia actualizada correctamente.",
      materia,
    });
  } catch (err) {
    console.error("❌ Error actualizando materia (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al actualizar la materia.",
      error: err.message,
    });
  }
};

/**
 * Eliminar materia
 */
exports.eliminarMateriaAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const materiaId = req.params.id;

    const universidadId = await findUniversidadForAdmin(adminId);
    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se puede eliminar la materia.",
      });
    }

    const materia = await Materia.findOneAndDelete({
      _id: materiaId,
      universidad: universidadId,
    });

    if (!materia) {
      return res.status(404).json({
        message: "Materia no encontrada o no pertenece a tu universidad.",
      });
    }

    return res.json({ message: "Materia eliminada correctamente." });
  } catch (err) {
    console.error("❌ Error eliminando materia (admin):", err);
    return res.status(500).json({
      message: "Ocurrió un error al eliminar la materia.",
      error: err.message,
    });
  }
};

/* =========================================================
   ASIGNAR MÓDULOS A UNA MATERIA (solo director)
   ========================================================= */
exports.asignarModulosMateriaAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const materiaId = req.params.id;

    const { modulosGlobalesIds = [], modulosLocalesIds = [] } = req.body;

    const universidadId = await findUniversidadForAdmin(adminId);
    if (!universidadId) {
      return res.status(400).json({
        message:
          "El admin no tiene una universidad válida asociada. No se pueden asignar módulos.",
      });
    }

    const materia = await Materia.findOne({
      _id: materiaId,
      universidad: universidadId,
    });

    if (!materia) {
      return res.status(404).json({
        message: "Materia no encontrada en tu universidad.",
      });
    }

    const cleanGlobales = [...new Set((modulosGlobalesIds || []).filter(Boolean))];
    const cleanLocales = [...new Set((modulosLocalesIds || []).filter(Boolean))];

    materia.modulosGlobales = cleanGlobales;
    materia.modulosLocales = cleanLocales;

    const allIds = [...cleanGlobales, ...cleanLocales];
    let labels = [];

    if (allIds.length) {
      const mods = await Modulo.find({ _id: { $in: allIds } })
        .select("titulo")
        .lean();

      labels = mods.map((m) => m.titulo).filter(Boolean);
    }

    materia.modulosLabels = labels;
    await materia.save();

    // Crear instancias para estudiantes ya inscritos
    const estudiantes = materia.estudiantes || [];

    for (const estudianteId of estudiantes) {
      for (const moduloId of allIds) {
        let moduloInstancia;

        try {
          moduloInstancia = await ModuloInstancia.create({
            estudiante: estudianteId,
            materia: materia._id,
            modulo: moduloId,
          });
        } catch {
          continue;
        }

        const submodulos = await Submodulo.find({ modulo: moduloId }).select("_id");
        const subIds = submodulos.map((s) => s._id);

        const ejercicios = await Ejercicio.find({
          submodulo: { $in: subIds },
        }).select("_id");

        for (const ej of ejercicios) {
          await EjercicioInstancia.create({
            estudiante: estudianteId,
            moduloInstancia: moduloInstancia._id,
            ejercicio: ej._id,
          }).catch(() => {});
        }
      }
    }

    return res.json({
      message: "Módulos asignados correctamente.",
      materia,
    });
  } catch (err) {
    console.error("❌ Error asignando módulos a materia:", err);
    return res.status(500).json({
      message: "Ocurrió un error al asignar los módulos a la materia.",
      error: err.message,
    });
  }
};

/* =========================================================
   AGREGAR ESTUDIANTES A UNA MATERIA
   ✅ Director puede agregar a cualquier materia de su universidad
   ✅ Profesor SOLO puede agregar a SU materia
   ✅ Crea instancias SOLO para nuevos estudiantes
   ========================================================= */
exports.agregarEstudiantesMateriaAdmin = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const materiaId = req.params.id;
    const { estudiantesIds = [] } = req.body;

    const universidadId = await findUniversidadForUser(userId);
    if (!universidadId) {
      return res.status(400).json({
        message:
          "El usuario no tiene una universidad válida asociada. No se pueden agregar estudiantes.",
      });
    }

    const materia = await Materia.findOne({
      _id: materiaId,
      universidad: universidadId,
    });

    if (!materia) {
      return res.status(404).json({
        message: "Materia no encontrada en tu universidad.",
      });
    }

    // ✅ Si es profesor, validar que sea SU materia
    if (req.user?.rol === "profesor") {
      const materiaProfesorId = String(materia.profesor);
      if (materiaProfesorId !== String(userId)) {
        return res.status(403).json({
          message: "Acceso denegado. Esta materia no está asignada a este profesor.",
        });
      }
    }

    const idsLimpios = [...new Set((estudiantesIds || []).filter(Boolean).map(String))];

    if (!idsLimpios.length) {
      return res.status(400).json({
        message: "No se han enviado estudiantes para agregar.",
      });
    }

    // Verificar estudiantes válidos (estudiante + misma universidad)
    const alumnos = await Usuario.find({
      _id: { $in: idsLimpios },
      rol: "estudiante",
      universidad: universidadId,
    }).select("_id");

    const idsValidos = alumnos.map((a) => String(a._id));

    const actualesSet = new Set((materia.estudiantes || []).map((id) => String(id)));

    // ✅ SOLO nuevos
    const nuevosIds = idsValidos.filter((id) => !actualesSet.has(id));

    if (nuevosIds.length === 0) {
      return res.json({
        message: "No hay nuevos estudiantes para agregar (ya estaban matriculados).",
        materia,
        totalEstudiantes: materia.estudiantes.length,
        nuevosAgregados: 0,
      });
    }

    nuevosIds.forEach((id) => actualesSet.add(id));
    materia.estudiantes = Array.from(actualesSet);
    await materia.save();

    // Crear instancias SOLO para nuevos estudiantes
    const todosModulos = [
      ...(materia.modulosGlobales || []),
      ...(materia.modulosLocales || []),
    ];

    for (const estudianteId of nuevosIds) {
      for (const moduloId of todosModulos) {
        let moduloInstancia;

        try {
          moduloInstancia = await ModuloInstancia.create({
            estudiante: estudianteId,
            materia: materia._id,
            modulo: moduloId,
          });
        } catch (err) {
          // Ya existe → continuamos
          continue;
        }

        const submodulos = await Submodulo.find({ modulo: moduloId }).select("_id");
        const subIds = submodulos.map((s) => s._id);

        const ejercicios = await Ejercicio.find({
          submodulo: { $in: subIds },
        }).select("_id");

        for (const ej of ejercicios) {
          await EjercicioInstancia.create({
            estudiante: estudianteId,
            moduloInstancia: moduloInstancia._id,
            ejercicio: ej._id,
          }).catch(() => {});
        }
      }
    }

    return res.json({
      message: "Estudiantes agregados correctamente a la materia.",
      materia,
      totalEstudiantes: materia.estudiantes.length,
      nuevosAgregados: nuevosIds.length,
    });
  } catch (err) {
    console.error("❌ Error agregando estudiantes a materia:", err);
    return res.status(500).json({
      message: "Ocurrió un error al agregar estudiantes a la materia.",
      error: err.message,
    });
  }
};

/* =========================================================
   LISTAR ESTUDIANTES DE UNA MATERIA
   ✅ Director: ok
   ✅ Profesor: solo si es su materia
   ========================================================= */
exports.listarEstudiantesMateriaAdmin = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const materiaId = req.params.id;

    const universidadId = await findUniversidadForUser(userId);
    if (!universidadId) {
      return res.status(400).json({
        message:
          "El usuario no tiene una universidad válida asociada. No se pueden listar estudiantes.",
      });
    }

    const materia = await Materia.findOne({
      _id: materiaId,
      universidad: universidadId,
    })
      .populate({
        path: "estudiantes",
        select: "nombre nombres apellidos email matricula activo",
      })
      .populate({
        path: "profesor",
        select: "_id",
      })
      .lean();

    if (!materia) {
      return res.status(404).json({
        message: "Materia no encontrada en tu universidad.",
      });
    }

    // ✅ Si es profesor, validar que sea SU materia
    if (req.user?.rol === "profesor") {
      const materiaProfesorId = String(materia.profesor?._id || materia.profesor);
      if (materiaProfesorId !== String(userId)) {
        return res.status(403).json({
          message: "Acceso denegado. Esta materia no está asignada a este profesor.",
        });
      }
    }

    const estudiantes = (materia.estudiantes || []).map((e) => ({
      _id: e._id,
      nombre:
        e.nombre ||
        `${e.nombres || ""} ${e.apellidos || ""}`.trim() ||
        "Estudiante sin nombre",
      email: e.email,
      matricula: e.matricula || "",
      activo: e.activo !== false,
    }));

    return res.json({
      materiaId,
      estudiantes,
      totalEstudiantes: estudiantes.length,
    });
  } catch (err) {
    console.error("❌ Error listando estudiantes de materia:", err);
    return res.status(500).json({
      message: "Ocurrió un error al obtener los estudiantes de la materia.",
      error: err.message,
    });
  }
};