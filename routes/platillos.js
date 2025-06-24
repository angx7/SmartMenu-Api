const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verificarToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// GET: obtener todos los platillos (solo mesero)
router.get("/", verificarToken, requireRole(2), (req, res) => {
  db.query("SELECT * FROM platillos", (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener platillos" });
    res.json(results);
  });
});

// POST: crear nuevo platillo (solo admin)
router.post("/", verificarToken, requireRole(1), (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  if (!nombre || !descripcion || !precio) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  const query =
    "INSERT INTO platillos (nombre, descripcion, precio) VALUES (?, ?, ?)";
  db.query(query, [nombre, descripcion, precio], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al insertar platillo", details: err.message });
    }
    res.status(201).json({
      message: "Platillo creado correctamente",
      platillo_id: result.insertId,
    });
  });
});

module.exports = router;
