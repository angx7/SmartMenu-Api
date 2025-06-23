const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

const verificarToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// GET: obtener todos los usuarios (solo admin)
router.get("/", verificarToken, requireRole(1), (req, res) => {
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener usuarios" });
    res.json(results);
  });
});

// POST: crear nuevo usuario (solo admin)
router.post("/", verificarToken, requireRole(1), async (req, res) => {
  const { nombre, usuario, contraseña, rol_id } = req.body;

  if (!nombre || !usuario || !contraseña || !rol_id) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const query =
      "INSERT INTO usuarios (nombre, usuario, contraseña, rol_id) VALUES (?, ?, ?, ?)";
    db.query(
      query,
      [nombre, usuario, hashedPassword, rol_id],
      (err, result) => {
        if (err)
          return res.status(500).json({ error: "Error al insertar usuario" });
        res.status(201).json({
          message: "Usuario creado correctamente",
          user_id: result.insertId,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Error al procesar la contraseña" });
  }
});

// PUT: actualizar usuario (solo admin)
router.put("/:id", verificarToken, requireRole(1), async (req, res) => {
  const userId = req.params.id;
  const { nombre, usuario, contraseña, rol_id } = req.body;
  if (!nombre || !usuario || !contraseña || !rol_id) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const query =
      "UPDATE usuarios SET nombre = ?, usuario = ?, contraseña = ?, rol_id = ? WHERE id = ?";
    db.query(
      query,
      [nombre, usuario, hashedPassword, rol_id, userId],
      (err, result) => {
        if (err)
          return res.status(500).json({ error: "Error al actualizar usuario" });
        if (result.affectedRows === 0)
          return res.status(404).json({ error: "Usuario no encontrado" });
        res.json({ message: "Usuario actualizado correctamente" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Error al procesar la contraseña" });
  }
});

module.exports = router;
