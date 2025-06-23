const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verificarToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// GET: obtener todos los clientes (solo admin)
router.get("/", verificarToken, requireRole(1), (req, res) => {
  db.query("SELECT * FROM clientes", (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener clientes" });
    res.json(results);
  });
});

// POST: crear nuevo cliente (solo admin)
router.post("/", verificarToken, requireRole(1), (req, res) => {
  const { nombre, email, telefono } = req.body;
  if (!nombre || !email || !telefono) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  const query =
    "INSERT INTO clientes (nombre, correo, telefono) VALUES (?, ?, ?)";
  db.query(query, [nombre, email, telefono], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al insertar cliente", details: err.message });
    }
    res.status(201).json({
      message: "Cliente creado correctamente",
      client_id: result.insertId,
    });
  });
});

module.exports = router;
