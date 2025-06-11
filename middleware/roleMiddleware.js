const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol_id)) {
      return res
        .status(403)
        .json({ error: "Acceso denegado: rol no autorizado" });
    }
    next();
  };
};

module.exports = requireRole;
