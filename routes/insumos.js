// routes/insumos.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Crear nuevo insumo y vincular con proveedor (sin verificación)
router.post("/", (req, res) => {
  const { nombre, stock, unidad, stock_minimo, proveedor_id, precio } =
    req.body;

  if (
    !nombre ||
    stock == null ||
    !unidad ||
    stock_minimo == null ||
    !proveedor_id ||
    !precio
  ) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const insertInsumo = `INSERT INTO insumos (nombre, stock, unidad, stock_minimo) VALUES (?, ?, ?, ?)`;

  db.query(
    insertInsumo,
    [nombre, stock, unidad, stock_minimo],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Error al crear insumo", details: err.message });

      const insumoId = result.insertId;

      const insertRelacion = `INSERT INTO insumos_proveedores (insumo_id, proveedor_id, precio) VALUES (?, ?, ?)`;

      db.query(insertRelacion, [insumoId, proveedor_id, precio], (err2) => {
        if (err2)
          return res.status(500).json({
            error: "Error al vincular proveedor",
            details: err2.message,
          });

        res
          .status(201)
          .json({ message: "Insumo y proveedor creados", insumo_id: insumoId });
      });
    }
  );
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
