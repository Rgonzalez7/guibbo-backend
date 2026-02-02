// server/controllers/importController.js
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Materia = require("../models/materia");

// 🔑 contraseña genérica (podés moverla a .env)
const DEFAULT_TEMP_PASSWORD = "Guibbo2025!";

/* =========================================
   IMPORTAR MATERIAS
   Campos esperados por cada materia:
   - nombre
   - codigo
   - grupo
   - profesorResponsable (texto en CSV)
   - periodoAcademico
   - cuatrimestre
   - creditos
   - aula
   - horario

   Además, el schema de Materia requiere:
   - universidad  (obtenemos de req.user.universidad)
   - profesor     (ObjectId de User, intentamos buscarlo por nombre)
   ========================================= */
exports.importarMaterias = async (req, res) => {
  try {
    const { materias = [] } = req.body;

    if (!Array.isArray(materias) || materias.length === 0) {
      return res.status(400).json({ message: "No se recibieron materias." });
    }

    // 👇 Tomamos la universidad del director autenticado
    const universidad = req.user?.universidad || null;
    if (!universidad) {
      return res.status(400).json({
        message:
          "No se pudo determinar la universidad del director autenticado.",
      });
    }

    let total = materias.length;
    let creadas = 0;
    let actualizadas = 0;

    for (const m of materias) {
      // Al menos nombre o código para considerar la fila
      if (!m.nombre && !m.codigo) continue;

      // 🔍 Filtro:
      // - Atamos la búsqueda a la misma universidad
      const filtroBase = { universidad };

      const filtro = m.codigo
        ? m.grupo
          ? { ...filtroBase, codigo: m.codigo, grupo: m.grupo }
          : { ...filtroBase, codigo: m.codigo }
        : { ...filtroBase, nombre: m.nombre, grupo: m.grupo || null };

      let existing = await Materia.findOne(filtro);

      // 🔢 Normalizar créditos
      let creditosFinal = 0;
      if (typeof m.creditos === "number") {
        creditosFinal = m.creditos;
      } else if (
        typeof m.creditos === "string" &&
        m.creditos.trim() !== ""
      ) {
        const parsed = Number(m.creditos);
        creditosFinal = Number.isNaN(parsed) ? 0 : parsed;
      }

      // 👨‍🏫 Resolver profesor (User) a partir de profesorResponsable
      //    - Primero intentamos por nombre completo (User.nombre)
      //    - Si no encontramos, usamos al director como fallback
      let profesorId = req.user._id; // fallback: el director
      if (m.profesorResponsable) {
        const nombreProf = String(m.profesorResponsable).trim();
        if (nombreProf) {
          const profDoc = await User.findOne({
            nombre: nombreProf,
            rol: "profesor",
            universidad,
          });

          if (profDoc) {
            profesorId = profDoc._id;
          }
        }
      }

      if (existing) {
        // 🔄 Actualizar materia existente
        existing.nombre = m.nombre || existing.nombre;
        existing.codigo = m.codigo || existing.codigo;
        existing.grupo = m.grupo || existing.grupo;
        existing.profesorResponsable =
          m.profesorResponsable || existing.profesorResponsable;
        existing.periodoAcademico =
          m.periodoAcademico || existing.periodoAcademico;
        existing.cuatrimestre = m.cuatrimestre || existing.cuatrimestre;

        if (creditosFinal !== undefined && creditosFinal !== null) {
          existing.creditos = creditosFinal;
        }

        existing.aula = m.aula || existing.aula;
        existing.horario = m.horario || existing.horario;

        // Siempre nos aseguramos de que tenga universidad y profesor
        existing.universidad = universidad;
        existing.profesor = profesorId;

        await existing.save();
        actualizadas++;
      } else {
        // 🆕 Crear nueva materia
        await Materia.create({
          nombre: m.nombre || "",
          codigo: m.codigo || "",
          grupo: m.grupo || "",
          profesorResponsable: m.profesorResponsable || "",
          periodoAcademico: m.periodoAcademico || "",
          cuatrimestre: m.cuatrimestre || "",
          creditos: creditosFinal || 0,
          aula: m.aula || "",
          horario: m.horario || "",
          // 👇 Campos requeridos por el schema
          universidad,
          profesor: profesorId,
        });
        creadas++;
      }
    }

    return res.json({
      message: "Importación de materias finalizada.",
      stats: { total, creadas, actualizadas },
    });
  } catch (err) {
    console.error("❌ Error importarMaterias:", err);
    return res
      .status(500)
      .json({ message: "Error al importar materias.", error: err.message });
  }
};

/* =========================================
   IMPORTAR PROFESORES
   - Usa solo el modelo User
   - Campos de cada profesor:
     nombres, apellidos, email
   - Mapea:
     - nombres  → User.nombres
     - apellidos → User.apellidos
     - nombre visible → nombres + apellidos
     - rol → "profesor"
   - 👉 Ahora además:
     - universidad → misma que el admin que importa
     - pais        → mismo que el admin que importa
   ========================================= */
exports.importarProfesores = async (req, res) => {
  try {
    const { profesores = [] } = req.body;

    if (!Array.isArray(profesores) || profesores.length === 0) {
      return res
        .status(400)
        .json({ message: "No se recibieron profesores." });
    }

    // 👇 Tomamos la universidad y país del ADMIN (director) autenticado
    const adminUniversidad = req.user?.universidad || "";
    const adminPais = req.user?.pais || "";

    const passwordHash = await bcrypt.hash(DEFAULT_TEMP_PASSWORD, 10);

    let total = profesores.length;
    let creados = 0;
    let actualizados = 0;
    let duplicados = 0;

    for (const p of profesores) {
      if (!p.email) continue;

      const email = String(p.email || "").toLowerCase().trim();
      if (!email) continue;

      let usuario = await User.findOne({ email });

      const nombres = p.nombres || "";
      const apellidos = p.apellidos || "";
      const nombreCompleto = `${nombres} ${apellidos}`.trim();

      if (!usuario) {
        // 🆕 Crear usuario profesor,
        //     con la misma universidad y país que el admin que importa
        usuario = await User.create({
          email,
          password: passwordHash,
          rol: "profesor",
          nombres,
          apellidos,
          nombre: nombreCompleto,
          universidad: adminUniversidad,
          pais: adminPais,
        });
        creados++;
      } else {
        // Ya existía un usuario con ese correo
        duplicados++;

        let huboCambios = false;

        if (nombres && nombres !== usuario.nombres) {
          usuario.nombres = nombres;
          huboCambios = true;
        }
        if (apellidos && apellidos !== usuario.apellidos) {
          usuario.apellidos = apellidos;
          huboCambios = true;
        }

        // Actualizamos nombre visible si tenemos algo más completo
        const nuevoNombre = nombreCompleto || usuario.nombre;
        if (nuevoNombre && nuevoNombre !== usuario.nombre) {
          usuario.nombre = nuevoNombre;
          huboCambios = true;
        }

        // Si era estudiante y ahora es profesor, lo subimos de rol
        if (usuario.rol === "estudiante") {
          usuario.rol = "profesor";
          huboCambios = true;
        }

        // 👇 Si no tenía universidad/pais, heredamos del admin
        if (!usuario.universidad && adminUniversidad) {
          usuario.universidad = adminUniversidad;
          huboCambios = true;
        }
        if (!usuario.pais && adminPais) {
          usuario.pais = adminPais;
          huboCambios = true;
        }

        if (huboCambios) {
          await usuario.save();
          actualizados++;
        }
      }
    }

    return res.json({
      message:
        "Importación de profesores finalizada. (Se genera contraseña genérica para nuevos usuarios)",
      stats: { total, creados, actualizados, duplicados },
      tempPasswordHint: DEFAULT_TEMP_PASSWORD,
    });
  } catch (err) {
    console.error("❌ Error importarProfesores:", err);
    return res.status(500).json({
      message: "Error al importar profesores.",
      error: err.message,
    });
  }
};

/* =========================================
   IMPORTAR ALUMNOS
   - Usa solo el modelo User
   - Campos de cada alumno (desde CSV):
     nombres, apellidos, email, carne (ID)
   - Mapea:
     - nombres     → User.nombres
     - apellidos   → User.apellidos
     - nombre vis. → nombres + apellidos
     - carne (ID)  → User.matricula
     - rol         → "estudiante"
   - Además:
     - universidad → misma que el admin que importa
     - pais        → mismo que el admin que importa
     - password    → DEFAULT_TEMP_PASSWORD (genérico)
   ========================================= */
   exports.importarAlumnos = async (req, res) => {
    try {
      const { alumnos = [] } = req.body;
  
      if (!Array.isArray(alumnos) || alumnos.length === 0) {
        return res.status(400).json({ message: "No se recibieron alumnos." });
      }
  
      // 👇 Universidad y país del ADMIN (director) autenticado
      const adminUniversidad = req.user?.universidad || "";
      const adminPais = req.user?.pais || "";
  
      const passwordHash = await bcrypt.hash(DEFAULT_TEMP_PASSWORD, 10);
  
      let total = alumnos.length;
      let creados = 0;
      let actualizados = 0;
      let duplicados = 0;
  
      for (const a of alumnos) {
        if (!a.email) continue;
  
        const email = String(a.email || "").toLowerCase().trim();
        if (!email) continue;
  
        let usuario = await User.findOne({ email });
  
        const nombres = a.nombres || "";
        const apellidos = a.apellidos || "";
        const nombreCompleto = `${nombres} ${apellidos}`.trim();
        const matricula = a.carne || a.id || "";
  
        if (!usuario) {
          // 🆕 Crear usuario estudiante,
          //     con misma universidad y país que el admin que importa
          usuario = await User.create({
            email,
            password: passwordHash,
            rol: "estudiante",
            nombres,
            apellidos,
            nombre: nombreCompleto,
            matricula,
            universidad: adminUniversidad,
            pais: adminPais,
          });
          creados++;
        } else {
          // Ya existía
          duplicados++;
  
          let huboCambios = false;
  
          if (nombres && nombres !== usuario.nombres) {
            usuario.nombres = nombres;
            huboCambios = true;
          }
          if (apellidos && apellidos !== usuario.apellidos) {
            usuario.apellidos = apellidos;
            huboCambios = true;
          }
  
          const nuevoNombre = nombreCompleto || usuario.nombre;
          if (nuevoNombre && nuevoNombre !== usuario.nombre) {
            usuario.nombre = nuevoNombre;
            huboCambios = true;
          }
  
          if (matricula && matricula !== usuario.matricula) {
            usuario.matricula = matricula;
            huboCambios = true;
          }
  
          // Si no tenía rol, lo dejamos como estudiante
          if (!usuario.rol) {
            usuario.rol = "estudiante";
            huboCambios = true;
          }
  
          // 👇 Igual que con profesores: heredamos universidad/pais si están vacíos
          if (!usuario.universidad && adminUniversidad) {
            usuario.universidad = adminUniversidad;
            huboCambios = true;
          }
          if (!usuario.pais && adminPais) {
            usuario.pais = adminPais;
            huboCambios = true;
          }
  
          if (huboCambios) {
            await usuario.save();
            actualizados++;
          }
        }
      }
  
      return res.json({
        message:
          "Importación de alumnos finalizada. (Se genera contraseña genérica para nuevos usuarios)",
        stats: { total, creados, actualizados, duplicados },
        tempPasswordHint: DEFAULT_TEMP_PASSWORD,
      });
    } catch (err) {
      console.error("❌ Error importarAlumnos:", err);
      return res.status(500).json({
        message: "Error al importar alumnos.",
        error: err.message,
      });
    }
  };