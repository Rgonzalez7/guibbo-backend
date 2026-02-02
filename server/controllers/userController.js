// server/controllers/userController.js
const User = require("../models/user");

// 🔒 helper: saca el id de donde sea que lo ponga verifyToken
function getUserIdFromReq(req) {
  return (
    req?.user?.id ||
    req?.user?._id ||
    req?.userId ||
    req?.uid ||
    req?.auth?.id ||
    null
  );
}

// helper: arma nombre si viene vacío
function buildNombre(u) {
  const full = String(u?.nombre || "").trim();
  if (full) return full;

  const nombres = String(u?.nombres || "").trim();
  const apellidos = String(u?.apellidos || "").trim();
  const composed = `${nombres} ${apellidos}`.trim();

  return composed || "Usuario";
}

// helper: limpia payload para no mandar password
function toPerfilResponse(u) {
  if (!u) return null;

  const nombre = buildNombre(u);

  return {
    _id: u._id,
    nombre,
    nombres: u.nombres || "",
    apellidos: u.apellidos || "",
    email: u.email,
    rol: u.rol,
    universidad: u.universidad || "",
    carrera: u.carrera || "",
    pais: u.pais || "",
    foto: u.foto || "",
    avatarUrl: u.foto || "",
    activo: u.activo,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

// ✅ GET /usuarios/perfil
async function getPerfil(req, res) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ message: "No autorizado (sin userId)." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Si nombre está vacío, lo actualizamos (opcional pero útil)
    const nombreFinal = buildNombre(user);
    if (nombreFinal !== (user.nombre || "").trim()) {
      user.nombre = nombreFinal;
      await user.save();
    }

    return res.json(toPerfilResponse(user));
  } catch (error) {
    console.error("[getPerfil]", error);
    return res.status(500).json({ message: "Error al obtener el perfil." });
  }
}

// ✅ PUT /usuarios/perfil
async function updatePerfil(req, res) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ message: "No autorizado (sin userId)." });
    }

    const allowed = [
      "nombre",
      "nombres",
      "apellidos",
      "universidad",
      "carrera",
      "pais",
      "matricula",
    ];

    const payload = {};
    for (const k of allowed) {
      if (req.body?.[k] !== undefined) payload[k] = req.body[k];
    }

    // Si actualizan nombres/apellidos pero no nombre, lo recalculamos:
    if (
      (payload.nombres !== undefined || payload.apellidos !== undefined) &&
      payload.nombre === undefined
    ) {
      // lo calculamos luego con el user resultante
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    Object.assign(user, payload);

    // Recalcular nombre si queda vacío o si solo cambiaron nombres/apellidos
    user.nombre = buildNombre(user);

    await user.save();

    return res.json(toPerfilResponse(user));
  } catch (error) {
    console.error("[updatePerfil]", error);
    return res.status(500).json({ message: "Error al actualizar el perfil." });
  }
}

// ✅ PUT /usuarios/foto
async function actualizarFotoPerfil(req, res) {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ message: "No autorizado (sin userId)." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    const fotoUrl = `/uploads/${file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { foto: fotoUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.json({
      message: "Foto actualizada correctamente.",
      foto: fotoUrl,
      user: toPerfilResponse(user),
    });
  } catch (error) {
    console.error("[actualizarFotoPerfil]", error);
    return res.status(500).json({ message: "Error al actualizar la foto de perfil." });
  }
}

module.exports = {
  getPerfil,
  updatePerfil,
  actualizarFotoPerfil,
};