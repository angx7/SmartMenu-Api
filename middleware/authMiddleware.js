const jwt = require("jsonwebtoken");
const SECRET = "clave-ultra-secreta-smartmenu";

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // formato: Bearer token

  if (!token) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user = user; // attach payload a la request
    next();
  });
};

module.exports = verificarToken;
