import express from "express";
import { db } from "../config/db.js";
import verificarToken from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==============================
// GET: obtener todos los clientes (solo admin)
// ==============================
router.get("/", verificarToken, requireRole(1), async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM clientes");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// ==============================
// GET: obtener cliente por ID
// ==============================
router.get("/:id", verificarToken, async (req, res) => {
  try {
    const clientId = req.params.id;
    const [results] = await db.query("SELECT * FROM clientes WHERE id = ?", [
      clientId,
    ]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener cliente" });
  }
});

// ==============================
// POST: crear nuevo cliente (solo admin)
// ==============================
router.post("/", verificarToken, requireRole(1), async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;

    if (!nombre || !email || !telefono) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const query =
      "INSERT INTO clientes (nombre, correo, telefono) VALUES (?, ?, ?)";
    const [result] = await db.query(query, [nombre, email, telefono]);

    res.status(201).json({
      message: "Cliente creado correctamente",
      client_id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al insertar cliente",
      details: err.message,
    });
  }
});

// ==============================
// PUT: actualizar cliente (solo admin)
// ==============================
router.put("/:id", verificarToken, requireRole(1), async (req, res) => {
  try {
    const clientId = req.params.id;
    const { nombre, email, telefono } = req.body;

    if (!nombre && !email && !telefono) {
      return res
        .status(400)
        .json({ error: "Debe proporcionar al menos un campo" });
    }

    // Construcción dinámica
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
    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente actualizado correctamente" });
  } catch (err) {
    res.status(500).json({
      error: "Error al actualizar cliente",
      details: err.message,
    });
  }
});

// ==============================
// DELETE: eliminar cliente (solo admin)
// ==============================
router.delete("/:id", verificarToken, requireRole(1), async (req, res) => {
  try {
    const clientId = req.params.id;

    const [result] = await db.query("DELETE FROM clientes WHERE id = ?", [
      clientId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente eliminado correctamente" });
  } catch (err) {
    res.status(500).json({
      error: "Error al eliminar cliente",
      details: err.message,
    });
  }
});

export default router;
