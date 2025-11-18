import express from "express";
import { db } from "../config/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET = "clave-ultra-secreta-smartmenu";

// ======================================================
// Middleware: solo Admin (1) o Cocinero (3)
// ======================================================
const adminOCocinero = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token)
      return res.status(403).json({ error: "Token no proporcionado" });

    const decoded = jwt.verify(token, SECRET);

    const [result] = await db.query(
      "SELECT rol_id FROM usuarios WHERE id = ?",
      [decoded.id]
    );

    if (result.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const rol = result[0].rol_id;

    if (rol === 1 || rol === 3) {
      req.user = decoded;
      return next();
    }

    return res.status(403).json({
      error: "Acceso restringido a cocineros o administradores",
    });
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// ======================================================
// POST /pedidos/mesa/:mesaId — obtener o crear pedido activo
// ======================================================
router.post("/mesa/:mesaId", async (req, res) => {
  try {
    const mesaId = req.params.mesaId;
    const { usuario_id, cliente_id } = req.body;

    if (!usuario_id) return res.status(400).json({ error: "Falta usuario_id" });

    // Buscar si ya existe pedido activo
    const [pedido] = await db.query(
      "SELECT id FROM pedidos WHERE mesa_id = ? AND estado = 'activo' LIMIT 1",
      [mesaId]
    );

    // ==========================================
    // Si ya existe un pedido activo
    // ==========================================
    if (pedido.length > 0) {
      const pedidoId = pedido[0].id;

      const [detalles] = await db.query(
        `
        SELECT pd.id, p.nombre, CAST(p.precio AS DECIMAL(10,2)) AS precio,
               pd.cantidad, CAST((p.precio * pd.cantidad) AS DECIMAL(10,2)) AS subtotal
        FROM pedido_detalles pd
        JOIN platillos p ON p.id = pd.platillo_id
        WHERE pd.pedido_id = ?
        `,
        [pedidoId]
      );

      const total = detalles.reduce((sum, d) => sum + Number(d.subtotal), 0);

      return res.json({
        pedido_id: pedidoId,
        nuevo: false,
        detalles,
        total: Number(total.toFixed(2)),
      });
    }

    // ==========================================
    // No existe → crear nuevo
    // ==========================================
    const clienteFinal = typeof cliente_id === "number" ? cliente_id : null;

    const [insert] = await db.query(
      `
        INSERT INTO pedidos (mesa_id, usuario_id, fecha, estado, cliente_id)
        VALUES (?, ?, NOW(), 'activo', ?)
      `,
      [mesaId, usuario_id, clienteFinal]
    );

    return res.status(201).json({
      pedido_id: insert.insertId,
      nuevo: true,
      detalles: [],
      total: 0,
    });
  } catch (err) {
    return res.status(500).json({ error: "Error creando/consultando pedido" });
  }
});

// ======================================================
// POST: Crear pedido (admin y mesero)
// ======================================================
router.post("/", async (req, res) => {
  try {
    const { mesa_id, cliente_id, usuario_id } = req.body;

    if (!usuario_id) return res.status(400).json({ error: "Falta usuario_id" });

    // Validar rol
    const [rolResult] = await db.query(
      `SELECT rol_id FROM usuarios WHERE id = ? LIMIT 1`,
      [usuario_id]
    );

    if (rolResult.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const rol = rolResult[0].rol_id;
    if (![1, 2].includes(rol)) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para crear pedidos" });
    }

    // Verificar si ya hay pedido activo en esa mesa
    const [existing] = await db.query(
      `SELECT id FROM pedidos WHERE mesa_id = ? AND estado = 'activo' LIMIT 1`,
      [mesa_id]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "Ya existe un pedido activo para esta mesa" });
    }

    // Crear pedido
    const clienteFinal = typeof cliente_id === "number" ? cliente_id : null;

    const [result] = await db.query(
      `
        INSERT INTO pedidos (mesa_id, usuario_id, fecha, estado, cliente_id)
        VALUES (?, ?, NOW(), 'activo', ?)
      `,
      [mesa_id, usuario_id, clienteFinal]
    );

    res.status(201).json({ pedido_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Error creando pedido" });
  }
});

// ======================================================
// POST: Agregar platillos a pedido existente
// ======================================================
router.post("/:pedidoId/platillos", async (req, res) => {
  try {
    const pedidoId = req.params.pedidoId;
    const { platillo_id, cantidad } = req.body;

    await db.query(
      `INSERT INTO pedido_detalles (pedido_id, platillo_id, cantidad) VALUES (?, ?, ?)`,
      [pedidoId, platillo_id, cantidad]
    );

    res.json({ message: "Platillo agregado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error agregando platillo" });
  }
});

// ======================================================
// PUT: Finalizar pedido
// ======================================================
router.put("/:pedidoId/finalizar", async (req, res) => {
  try {
    const pedidoId = req.params.pedidoId;

    const [result] = await db.query(
      "UPDATE pedidos SET estado = 'finalizado' WHERE id = ?",
      [pedidoId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Pedido no encontrado" });

    res.json({ message: "Pedido finalizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error finalizando pedido" });
  }
});

// ======================================================
// GET: Comandas (pedidos activos + detalles)
// ======================================================
router.get("/comandas", adminOCocinero, async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `
      SELECT p.id AS pedido_id, p.mesa_id, p.estado, p.fecha, u.nombre AS mesero
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.estado = 'activo'
      ORDER BY p.fecha DESC
      `
    );

    if (pedidos.length === 0) return res.json([]);

    const pedidoIds = pedidos.map((p) => p.pedido_id);

    const [detalles] = await db.query(
      `
      SELECT pd.pedido_id, pl.nombre AS platillo, pd.cantidad
      FROM pedido_detalles pd
      JOIN platillos pl ON pd.platillo_id = pl.id
      WHERE pd.pedido_id IN (?)
      `,
      [pedidoIds]
    );

    const pedidosConDetalles = pedidos.map((pedido) => {
      const comanda = detalles.filter((d) => d.pedido_id === pedido.pedido_id);
      return { ...pedido, comanda };
    });

    res.json(pedidosConDetalles);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo comandas" });
  }
});

export default router;
