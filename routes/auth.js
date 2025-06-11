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

module.exports = router;
