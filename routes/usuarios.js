import express from "express";
import { db } from "../config/db.js";
import bcrypt from "bcryptjs";

import verificarToken from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// ====================================================
// GET: obtener todos los usuarios (solo admin)
// ====================================================
router.get("/", verificarToken, requireRole(1), async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM usuarios");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// ====================================================
// POST: crear nuevo usuario (solo admin)
// ====================================================
router.post("/", verificarToken, requireRole(1), async (req, res) => {
  const { nombre, usuario, contraseña, rol_id } = req.body;

  if (!nombre || !usuario || !contraseña || !rol_id) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const query = `
      INSERT INTO usuarios (nombre, usuario, contraseña, rol_id)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      nombre,
      usuario,
      hashedPassword,
      rol_id,
    ]);

    res.status(201).json({
      message: "Usuario creado correctamente",
      user_id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: "Error al insertar usuario" });
  }
});

// ====================================================
// PUT: actualizar usuario (solo admin)
// ====================================================
router.put("/:id", verificarToken, requireRole(1), async (req, res) => {
  const userId = req.params.id;
  const { nombre, usuario, contraseña, rol_id } = req.body;

  if (!nombre || !usuario || !rol_id) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    let query;
    let params;

    if (contraseña) {
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      query = `
        UPDATE usuarios
        SET nombre = ?, usuario = ?, contraseña = ?, rol_id = ?
        WHERE id = ?
      `;
      params = [nombre, usuario, hashedPassword, rol_id, userId];
    } else {
      query = `
        UPDATE usuarios
        SET nombre = ?, usuario = ?, rol_id = ?
        WHERE id = ?
      `;
      params = [nombre, usuario, rol_id, userId];
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// ====================================================
// DELETE: eliminar usuario (solo admin)
// ====================================================
router.delete("/:id", verificarToken, requireRole(1), async (req, res) => {
  try {
    const userId = req.params.id;
    const [result] = await db.query("DELETE FROM usuarios WHERE id = ?", [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// ====================================================
// GET: obtener usuarios por rol (solo admin)
// ====================================================
router.get("/rol/:rolId", verificarToken, requireRole(1), async (req, res) => {
  try {
    const rolId = req.params.rolId;

    const [results] = await db.query(
      "SELECT * FROM usuarios WHERE rol_id = ?",
      [rolId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "No se encontraron usuarios" });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios por rol" });
  }
});

// ====================================================
// GET: obtener todos los roles (solo admin)
// ====================================================

router.get("/roles/all", verificarToken, requireRole(1), async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM roles");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener roles" });
  }
});

export default router;
