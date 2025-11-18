/**
 * Middleware de roles (ESM)
 * rolesPermitidos: array de IDs de rol permitidos
 */
export default function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol_id)) {
      return res.status(403).json({
        error: "Acceso denegado: rol no autorizado",
      });
    }
    next();
  };
}
