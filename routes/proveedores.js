// routes/proveedores.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Crear proveedor
router.post("/", (req, res) => {
  const { nombre, contacto, telefono, correo } = req.body;

  const insert = `INSERT INTO proveedores (nombre, contacto, telefono, correo) VALUES (?, ?, ?, ?)`;
  db.query(insert, [nombre, contacto, telefono, correo], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al crear proveedor" });
    res.status(201).json({ proveedor_id: result.insertId });
  });
});

// Consultar todos los proveedores
router.get("/", (req, res) => {
  const query = `SELECT * FROM proveedores`;
  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener proveedores" });
    res.json(results);
  });
});

// Actualizar proveedor
router.put("/:id", (req, res) => {
  const proveedorId = req.params.id;
  const { nombre, contacto, telefono, correo } = req.body;

  const update = `
    UPDATE proveedores SET nombre = ?, contacto = ?, telefono = ?, correo = ?
    WHERE id = ?
  `;

  db.query(
    update,
    [nombre, contacto, telefono, correo, proveedorId],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Error al actualizar proveedor" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Proveedor no encontrado" });
      res.json({ message: "Proveedor actualizado correctamente" });
    }
  );
});

// Dar de baja proveedor (eliminación lógica si se desea)
router.delete("/:id", (req, res) => {
  const proveedorId = req.params.id;

  const eliminar = `DELETE FROM proveedores WHERE id = ?`;
  db.query(eliminar, [proveedorId], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Error al eliminar proveedor" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json({ message: "Proveedor eliminado correctamente" });
  });
});

module.exports = router;
