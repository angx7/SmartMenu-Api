import express from "express";
import { db } from "../config/db.js";
import verificarToken from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// ========================================
// GET: obtener todos los platillos (solo mesero)
// Rol mesero = 2
// ========================================
router.get("/", verificarToken, requireRole(2), async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM platillos");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener platillos" });
  }
});

// ========================================
// POST: crear nuevo platillo (solo admin)
// Rol admin = 1
// ========================================
router.post("/", verificarToken, requireRole(1), async (req, res) => {
  try {
    const { nombre, descripcion, precio } = req.body;

    if (!nombre || !descripcion || !precio) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const query = `
      INSERT INTO platillos (nombre, descripcion, precio)
      VALUES (?, ?, ?)
    `;

    const [result] = await db.query(query, [nombre, descripcion, precio]);

    res.status(201).json({
      message: "Platillo creado correctamente",
      platillo_id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al insertar platillo",
      details: err.message,
    });
  }
});

export default router;
