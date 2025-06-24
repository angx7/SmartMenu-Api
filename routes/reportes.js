// routes/reportes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verificarToken = require("../middleware/authMiddleware");

// Middleware para permitir solo al admin (rol_id = 1)
const soloAdmin = (req, res, next) => {
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ error: "Falta usuario_id" });

  const query = `SELECT rol_id FROM usuarios WHERE id = ?`;
  db.query(query, [usuario_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error validando rol" });
    if (result.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    if (result[0].rol_id !== 1) {
      return res
        .status(403)
        .json({ error: "Acceso restringido al administrador" });
    }
    next();
  });
};

// Reporte de ventas diarias (total por fecha)
router.post("/ventas-diarias", verificarToken, soloAdmin, (req, res) => {
  const query = `
    SELECT DATE(p.fecha) AS fecha, SUM(pd.cantidad * pl.precio) AS total
    FROM pedidos p
    JOIN pedido_detalles pd ON p.id = pd.pedido_id
    JOIN platillos pl ON pd.platillo_id = pl.id
    WHERE p.estado = 'servido'
    GROUP BY DATE(p.fecha)
    ORDER BY fecha DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error generando reporte" });
    res.json(results);
  });
});

// Reporte de platillos más vendidos
router.post(
  "/platillos-mas-vendidos",
  verificarToken,
  soloAdmin,
  (req, res) => {
    const query = `
    SELECT pl.nombre, SUM(pd.cantidad) AS total_vendidos
    FROM pedido_detalles pd
    JOIN platillos pl ON pd.platillo_id = pl.id
    GROUP BY pl.nombre
    ORDER BY total_vendidos DESC
    LIMIT 10
  `;

    db.query(query, (err, results) => {
      if (err)
        return res.status(500).json({ error: "Error generando reporte" });
      res.json(results);
    });
  }
);

// Reporte de insumos que están por debajo del stock mínimo con su proveedor más barato
router.post("/insumos-faltantes", verificarToken, soloAdmin, (req, res) => {
  const query = `
    SELECT i.nombre AS insumo, i.stock, i.stock_minimo, p.nombre AS proveedor, ip.precio
    FROM insumos i
    JOIN insumos_proveedores ip ON i.id = ip.insumo_id
    JOIN proveedores p ON ip.proveedor_id = p.id
    WHERE i.stock < i.stock_minimo AND ip.precio = (
      SELECT MIN(ip2.precio)
      FROM insumos_proveedores ip2
      WHERE ip2.insumo_id = i.id
    )
    ORDER BY i.nombre
  `;

  db.query(query, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Error generando reporte de insumos faltantes" });
    res.json(results);
  });
});

module.exports = router;
