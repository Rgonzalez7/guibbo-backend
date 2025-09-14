const User = require('../models/user');
const path = require('path');

const actualizarFotoPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No se subió ningún archivo.' });
    }

    const fotoUrl = `/uploads/${file.filename}`;

    const user = await User.findByIdAndUpdate(userId, { foto: fotoUrl }, { new: true });
    res.json({ message: 'Foto actualizada correctamente.', foto: fotoUrl });
  } catch (error) {
    console.error('[actualizarFotoPerfil]', error);
    res.status(500).json({ message: 'Error al actualizar la foto de perfil.' });
  }
};

module.exports = { actualizarFotoPerfil };