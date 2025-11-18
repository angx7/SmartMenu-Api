import express from "express";
import { db } from "../config/db.js";
import verificarToken from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// Middleware: solo admin (rol_id = 1)
// ======================================================
const soloAdmin = async (req, res, next) => {
  try {
    const { usuario_id } = req.body;

    if (!usuario_id) return res.status(400).json({ error: "Falta usuario_id" });

    const [result] = await db.query(
      "SELECT rol_id FROM usuarios WHERE id = ?",
      [usuario_id]
    );

    if (result.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    if (result[0].rol_id !== 1) {
      return res
        .status(403)
        .json({ error: "Acceso restringido al administrador" });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: "Error validando rol" });
  }
};

// ======================================================
// REPORTE: Ventas diarias
// ======================================================
router.post("/ventas-diarias", verificarToken, soloAdmin, async (req, res) => {
  try {
    const query = `
      SELECT DATE(p.fecha) AS fecha, SUM(pd.cantidad * pl.precio) AS total
      FROM pedidos p
      JOIN pedido_detalles pd ON p.id = pd.pedido_id
      JOIN platillos pl ON pd.platillo_id = pl.id
      WHERE p.estado = 'finalizado'
      GROUP BY DATE(p.fecha)
      ORDER BY fecha DESC
    `;

    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error generando reporte" });
  }
});

// ======================================================
// REPORTE: Platillos más vendidos
// ======================================================
router.post(
  "/platillos-mas-vendidos",
  verificarToken,
  soloAdmin,
  async (req, res) => {
    try {
      const query = `
        SELECT pl.nombre, SUM(pd.cantidad) AS total_vendidos
        FROM pedido_detalles pd
        JOIN platillos pl ON pd.platillo_id = pl.id
        GROUP BY pl.nombre
        ORDER BY total_vendidos DESC
        LIMIT 10
      `;

      const [results] = await db.query(query);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Error generando reporte" });
    }
  }
);

// ======================================================
// REPORTE: Insumos faltantes (stock bajo + proveedor más barato)
// ======================================================
router.post(
  "/insumos-faltantes",
  verificarToken,
  soloAdmin,
  async (req, res) => {
    try {
      const query = `
        SELECT i.nombre AS insumo, i.stock, i.stock_minimo,
               p.nombre AS proveedor, ip.precio
        FROM insumos i
        JOIN insumos_proveedores ip ON i.id = ip.insumo_id
        JOIN proveedores p ON ip.proveedor_id = p.id
        WHERE i.stock < i.stock_minimo
        AND ip.precio = (
          SELECT MIN(ip2.precio)
          FROM insumos_proveedores ip2
          WHERE ip2.insumo_id = i.id
        )
        ORDER BY i.nombre
      `;

      const [results] = await db.query(query);
      res.json(results);
    } catch (err) {
      res.status(500).json({
        error: "Error generando reporte de insumos faltantes",
      });
    }
  }
);

export default router;
