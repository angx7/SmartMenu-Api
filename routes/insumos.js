// routes/insumos.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Crear nuevo insumo
router.post("/", (req, res) => {
  const { nombre, stock, unidad, stock_minimo } = req.body;
  const query = `INSERT INTO insumos (nombre, stock, unidad, stock_minimo) VALUES (?, ?, ?, ?)`;
  db.query(query, [nombre, stock, unidad, stock_minimo], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al crear insumo" });
    res.status(201).json({ insumo_id: result.insertId });
  });
});

// Obtener todos los insumos
router.get("/", (req, res) => {
  const query = `SELECT * FROM insumos`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener insumos" });
    res.json(results);
  });
});

// Obtener insumos con stock bajo
router.get("/stock/bajo", (req, res) => {
  const query = `SELECT * FROM insumos WHERE stock < stock_minimo`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al verificar stock" });
    res.json(results);
  });
});

// Actualizar insumo
router.put("/:id", (req, res) => {
  const insumoId = req.params.id;
  const { nombre, stock, unidad, stock_minimo } = req.body;
  const update = `UPDATE insumos SET nombre = ?, stock = ?, unidad = ?, stock_minimo = ? WHERE id = ?`;
  db.query(
    update,
    [nombre, stock, unidad, stock_minimo, insumoId],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Error al actualizar insumo" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Insumo no encontrado" });
      res.json({ message: "Insumo actualizado correctamente" });
    }
  );
});

module.exports = router;
