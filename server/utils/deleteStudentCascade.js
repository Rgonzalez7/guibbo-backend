// server/utils/deleteStudentCascade.js
const ModuloInstancia = require("../models/moduloInstancia");
const EjercicioInstancia = require("../models/ejercicioInstancia");

/**
 * Borra todas las instancias/progreso asociadas a un estudiante.
 * - Primero EjercicioInstancia (depende de ModuloInstancia)
 * - Luego ModuloInstancia
 *
 * @param {string|ObjectId} estudianteId
 * @param {mongoose.ClientSession} session
 */
async function deleteStudentCascade(estudianteId, session) {
  if (!estudianteId) return;

  // 1) borrar ejercicios del estudiante
  await EjercicioInstancia.deleteMany(
    { estudiante: estudianteId },
    session ? { session } : undefined
  );

  // 2) borrar módulos del estudiante
  await ModuloInstancia.deleteMany(
    { estudiante: estudianteId },
    session ? { session } : undefined
  );
}

module.exports = { deleteStudentCascade };