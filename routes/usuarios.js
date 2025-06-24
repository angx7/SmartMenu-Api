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

  if (!nombre || !usuario || !rol_id) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    let query, params;
    if (contraseña) {
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      query =
        "UPDATE usuarios SET nombre = ?, usuario = ?, contraseña = ?, rol_id = ? WHERE id = ?";
      params = [nombre, usuario, hashedPassword, rol_id, userId];
    } else {
      query =
        "UPDATE usuarios SET nombre = ?, usuario = ?, rol_id = ? WHERE id = ?";
      params = [nombre, usuario, rol_id, userId];
    }

    db.query(query, params, (err, result) => {
      if (err)
        return res.status(500).json({ error: "Error al actualizar usuario" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Usuario no encontrado" });
      res.json({ message: "Usuario actualizado correctamente" });
    });
  } catch (err) {
    res.status(500).json({ error: "Error al procesar la contraseña" });
  }
});

// DELETE: eliminar usuario (solo admin)
router.delete("/:id", verificarToken, requireRole(1), (req, res) => {
  const userId = req.params.id;
  const query = "DELETE FROM usuarios WHERE id = ?";
  db.query(query, [userId], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Error al eliminar usuario" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  });
});

// obtener usuario por rol (solo admin)
router.get("/rol/:rolId", verificarToken, requireRole(1), (req, res) => {
  const rolId = req.params.rolId;
  const query = "SELECT * FROM usuarios WHERE rol_id = ?";
  db.query(query, [rolId], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener usuarios" });
    if (results.length === 0)
      return res.status(404).json({ error: "No se encontraron usuarios" });
    res.json(results);
  });
});

module.exports = router;
