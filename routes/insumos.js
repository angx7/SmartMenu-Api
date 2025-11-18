import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// ==============================
// POST: Crear nuevo insumo y vincular proveedor
// ==============================
router.post("/", async (req, res) => {
  try {
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

    // Crear insumo
    const insertInsumo =
      "INSERT INTO insumos (nombre, stock, unidad, stock_minimo) VALUES (?, ?, ?, ?)";

    const [result] = await db.query(insertInsumo, [
      nombre,
      stock,
      unidad,
      stock_minimo,
    ]);

    const insumoId = result.insertId;

    // Crear relación con proveedor
    const insertRelacion =
      "INSERT INTO insumos_proveedores (insumo_id, proveedor_id, precio) VALUES (?, ?, ?)";

    await db.query(insertRelacion, [insumoId, proveedor_id, precio]);

    res.status(201).json({
      message: "Insumo y proveedor creados",
      insumo_id: insumoId,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al crear insumo o vincular proveedor",
      details: err.message,
    });
  }
});

// ==============================
// GET: Obtener todos los insumos
// ==============================
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM insumos");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener insumos" });
  }
});

// ==============================
// GET: Insumos con stock bajo
// ==============================
router.get("/stock/bajo", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM insumos WHERE stock < stock_minimo"
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error al verificar stock" });
  }
});

// ==============================
// PUT: Actualizar insumo
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const insumoId = req.params.id;
    const { nombre, stock, unidad, stock_minimo } = req.body;

    const update =
      "UPDATE insumos SET nombre = ?, stock = ?, unidad = ?, stock_minimo = ? WHERE id = ?";

    const [result] = await db.query(update, [
      nombre,
      stock,
      unidad,
      stock_minimo,
      insumoId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }

    res.json({ message: "Insumo actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar insumo" });
  }
});

export default router;
