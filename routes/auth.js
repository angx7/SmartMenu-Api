import express from "express";
import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

const SECRET = "clave-ultra-secreta-smartmenu";

// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    const [results] = await db.query(
      "SELECT * FROM usuarios WHERE usuario = ?",
      [usuario]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);

    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, rol_id: user.rol_id },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ======================
// CONSULTAR ROL
// ======================
router.get("/rol", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    const decoded = jwt.verify(token, SECRET);

    const [results] = await db.query(
      `
        SELECT r.nombre AS rol
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE u.id = ?
      `,
      [decoded.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ rol: results[0].rol });
  } catch (err) {
    console.error("Error en /rol:", err);
    return res.status(401).json({ error: "Token inválido" });
  }
});

export default router;
