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

// GET: obtener cliente por ID (cualquiera)
router.get("/:id", verificarToken, (req, res) => {
  const clientId = req.params.id;
  const query = "SELECT * FROM clientes WHERE id = ?";
  db.query(query, [clientId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener cliente" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(results[0]);
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

// PUT: actualizar cliente (solo admin)
router.put("/:id", verificarToken, requireRole(1), (req, res) => {
  const clientId = req.params.id;
  const { nombre, email, telefono } = req.body;

  // Verifica que al menos un campo esté presente
  if (!nombre && !email && !telefono) {
    return res
      .status(400)
      .json({ error: "Debe proporcionar al menos un campo para actualizar" });
  }

  // Construye dinámicamente la consulta y los valores
  const fields = [];
  const values = [];
  if (nombre) {
    fields.push("nombre = ?");
    values.push(nombre);
  }
  if (email) {
    fields.push("correo = ?");
    values.push(email);
  }
  if (telefono) {
    fields.push("telefono = ?");
    values.push(telefono);
  }
  values.push(clientId);

  const query = `UPDATE clientes SET ${fields.join(", ")} WHERE id = ?`;
  db.query(query, values, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al actualizar cliente", details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json({ message: "Cliente actualizado correctamente" });
  });
});

// DELETE: eliminar cliente (solo admin)
router.delete("/:id", verificarToken, requireRole(1), (req, res) => {
  const clientId = req.params.id;
  const query = "DELETE FROM clientes WHERE id = ?";
  db.query(query, [clientId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al eliminar cliente", details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json({ message: "Cliente eliminado correctamente" });
  });
});

module.exports = router;
