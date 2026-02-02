module.exports = function requireRole(...rolesPermitidos) {
    return (req, res, next) => {
      try {
        const rol = req.user?.rol;
  
        if (!rol) {
          return res.status(401).json({ message: 'No autenticado' });
        }
  
        if (!rolesPermitidos.includes(rol)) {
          return res.status(403).json({ message: 'No tienes permisos suficientes' });
        }
  
        next();
      } catch (err) {
        console.error('❌ requireRole error:', err);
        return res.status(500).json({ message: 'Error en verificación de rol' });
      }
    };
  };