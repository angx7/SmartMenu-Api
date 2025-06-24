// routes/pedidos.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Obtener cuenta de una mesa (pedido activo + detalles + total)
router.get("/mesa/:mesaId", (req, res) => {
  const mesaId = req.params.mesaId;

  const getPedido = `SELECT id FROM pedidos WHERE mesa_id = ? AND estado = 'activo' LIMIT 1`;
  db.query(getPedido, [mesaId], (err, pedidoResult) => {
    if (err) return res.status(500).json({ error: "Error buscando pedido" });
    if (pedidoResult.length === 0)
      return res.status(404).json({ error: "La mesa no tiene pedido activo" });

    const pedidoId = pedidoResult[0].id;

    const getDetalles = `
      SELECT pd.id, p.nombre, CAST(p.precio AS DECIMAL(10,2)) AS precio, pd.cantidad, 
             CAST((p.precio * pd.cantidad) AS DECIMAL(10,2)) AS subtotal
      FROM pedido_detalles pd
      JOIN platillos p ON p.id = pd.platillo_id
      WHERE pd.pedido_id = ?`;

    db.query(getDetalles, [pedidoId], (err, detalles) => {
      if (err)
        return res.status(500).json({ error: "Error obteniendo detalles" });

      const total = detalles.reduce(
        (sum, item) => sum + Number(item.subtotal),
        0
      );
      res.json({
        pedido_id: pedidoId,
        detalles,
        total: Number(total.toFixed(2)),
      });
    });
  });
});

// Crear pedido nuevo (solo si usuario es mesero o admin)
router.post("/", (req, res) => {
  const { mesa_id, cliente_id, usuario_id } = req.body;

  if (!usuario_id) return res.status(400).json({ error: "Falta usuario_id" });

  const getRol = `SELECT rol_id FROM usuarios WHERE id = ? LIMIT 1`;
  db.query(getRol, [usuario_id], (err, rolResult) => {
    if (err) return res.status(500).json({ error: "Error consultando rol" });
    if (rolResult.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const rol = rolResult[0].rol_id;
    if (![1, 2].includes(rol)) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para crear pedidos" });
    }

    const check = `SELECT id FROM pedidos WHERE mesa_id = ? AND estado = 'activo' LIMIT 1`;
    db.query(check, [mesa_id], (err, existing) => {
      if (err) return res.status(500).json({ error: "Error validando pedido" });
      if (existing.length > 0)
        return res
          .status(400)
          .json({ error: "Ya existe un pedido activo para esta mesa" });

      const insert = `
        INSERT INTO pedidos (mesa_id, usuario_id, fecha, estado, cliente_id)
        VALUES (?, ?, NOW(), 'activo', ?)
      `;

      const clienteFinal = typeof cliente_id === "number" ? cliente_id : null;

      db.query(insert, [mesa_id, usuario_id, clienteFinal], (err, result) => {
        if (err) return res.status(500).json({ error: "Error creando pedido" });
        res.status(201).json({ pedido_id: result.insertId });
      });
    });
  });
});

// Agregar platillos a un pedido existente (capturar más)
router.post("/:pedidoId/platillos", (req, res) => {
  const pedidoId = req.params.pedidoId;
  const { platillo_id, cantidad } = req.body;

  const insert = `INSERT INTO pedido_detalles (pedido_id, platillo_id, cantidad) VALUES (?, ?, ?)`;
  db.query(insert, [pedidoId, platillo_id, cantidad], (err) => {
    if (err) return res.status(500).json({ error: "Error agregando platillo" });
    res.json({ message: "Platillo agregado correctamente" });
  });
});

// Finalizar pedido (cambiar estado a 'finalizado')
router.put("/:pedidoId/finalizar", (req, res) => {
  const pedidoId = req.params.pedidoId;
  const update = `UPDATE pedidos SET estado = 'finalizado' WHERE id = ?`;
  db.query(update, [pedidoId], (err, result) => {
    if (err) return res.status(500).json({ error: "Error finalizando pedido" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Pedido no encontrado" });
    res.json({ message: "Pedido finalizado correctamente" });
  });
});

module.exports = router;
