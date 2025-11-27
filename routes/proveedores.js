import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// ============================================
// POST: Crear proveedor
// ============================================
router.post("/", async (req, res) => {
  try {
    const { nombre, contacto, telefono, correo } = req.body;

    const insert = `
      INSERT INTO proveedores (nombre, contacto, telefono, correo)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(insert, [
      nombre,
      contacto,
      telefono,
      correo,
    ]);

    res.status(201).json({ proveedor_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Error al crear proveedor" });
  }
});

// ============================================
// GET: Consultar todos los proveedores
// ============================================
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM proveedores");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
});

// ============================================
// GET: Consultar proveedor por ID
// ============================================

router.get("/:id", async (req, res) => {
  try {
    const proveedorId = req.params.id;

    const [results] = await db.query("SELECT * FROM proveedores WHERE id = ?", [
      proveedorId,
    ]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener proveedor" });
  }
});

// ============================================
// PUT: Actualizar proveedor
// ============================================
router.put("/:id", async (req, res) => {
  try {
    const proveedorId = req.params.id;
    const { nombre, contacto, telefono, correo } = req.body;

    const update = `
      UPDATE proveedores
      SET nombre = ?, contacto = ?, telefono = ?, correo = ?
      WHERE id = ?
    `;

    const [result] = await db.query(update, [
      nombre,
      contacto,
      telefono,
      correo,
      proveedorId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar proveedor" });
  }
});

// ============================================
// DELETE: Eliminar proveedor
// ============================================
router.delete("/:id", async (req, res) => {
  try {
    const proveedorId = req.params.id;

    const [result] = await db.query("DELETE FROM proveedores WHERE id = ?", [
      proveedorId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar proveedor" });
  }
});

export default router;
