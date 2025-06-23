const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "clave-ultra-secreta-smartmenu";

router.post("/login", (req, res) => {
  const { usuario, contraseña } = req.body;

  if (!usuario || !contraseña) {
    return res.status(400).json({ error: "Faltan campos" });
  }

  const query = "SELECT * FROM usuarios WHERE usuario = ?";
  db.query(query, [usuario], async (err, results) => {
    if (err) return res.status(500).json({ error: "Error interno" });
    if (results.length === 0)
      return res.status(401).json({ error: "Usuario no encontrado" });

    const user = results[0];
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, rol_id: user.rol_id },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token });
  });
});

router.get("/rol", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token inválido" });

    const query = `
      SELECT r.nombre AS rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.id = ?
    `;

    db.query(query, [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ error: "Error interno" });
      if (results.length === 0)
        return res.status(404).json({ error: "Usuario no encontrado" });

      res.json({ rol: results[0].rol });
    });
  });
});

module.exports = router;
