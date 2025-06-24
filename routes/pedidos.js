// routes/pedidos.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Middleware para permitir solo admin o cocinero
const adminOCocinero = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Token no proporcionado" });

  const jwt = require("jsonwebtoken");
  const SECRET = "clave-ultra-secreta-smartmenu";

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token inválido" });

    const query = `SELECT rol_id FROM usuarios WHERE id = ?`;
    db.query(query, [decoded.id], (err, result) => {
      if (err) return res.status(500).json({ error: "Error validando rol" });
      if (result.length === 0)
        return res.status(404).json({ error: "Usuario no encontrado" });

      const rol = result[0].rol_id;
      if (rol === 1 || rol === 3) {
        next();
      } else {
        return res
          .status(403)
          .json({ error: "Acceso restringido a cocineros o administradores" });
      }
    });
  });
};

// // Obtener cuenta de una mesa (pedido activo + detalles + total)
// router.get("/mesa/:mesaId", (req, res) => {
//   const mesaId = req.params.mesaId;

//   const getPedido = `SELECT id FROM pedidos WHERE mesa_id = ? AND estado = 'activo' LIMIT 1`;
//   db.query(getPedido, [mesaId], (err, pedidoResult) => {
//     if (err) return res.status(500).json({ error: "Error buscando pedido" });
//     if (pedidoResult.length === 0)
//       return res.status(404).json({ error: "La mesa no tiene pedido activo" });

//     const pedidoId = pedidoResult[0].id;

//     const getDetalles = `
//       SELECT pd.id, p.nombre, CAST(p.precio AS DECIMAL(10,2)) AS precio, pd.cantidad,
//              CAST((p.precio * pd.cantidad) AS DECIMAL(10,2)) AS subtotal
//       FROM pedido_detalles pd
//       JOIN platillos p ON p.id = pd.platillo_id
//       WHERE pd.pedido_id = ?`;

//     db.query(getDetalles, [pedidoId], (err, detalles) => {
//       if (err)
//         return res.status(500).json({ error: "Error obteniendo detalles" });

//       const total = detalles.reduce(
//         (sum, item) => sum + Number(item.subtotal),
//         0
//       );
//       res.json({
//         pedido_id: pedidoId,
//         detalles,
//         total: Number(total.toFixed(2)),
//       });
//     });
//   });
// });

// POST /pedidos/mesa/:mesaId
router.post("/mesa/:mesaId", (req, res) => {
  const mesaId = req.params.mesaId;
  const { usuario_id, cliente_id } = req.body;

  if (!usuario_id) return res.status(400).json({ error: "Falta usuario_id" });

  // Buscar si ya existe un pedido activo
  const buscarPedido = `SELECT id FROM pedidos WHERE mesa_id = ? AND estado = 'activo' LIMIT 1`;

  db.query(buscarPedido, [mesaId], (err, resultado) => {
    if (err) return res.status(500).json({ error: "Error buscando pedido" });

    if (resultado.length > 0) {
      // Ya existe un pedido activo
      const pedidoId = resultado[0].id;

      const getDetalles = `
        SELECT pd.id, p.nombre, CAST(p.precio AS DECIMAL(10,2)) AS precio, pd.cantidad, 
               CAST((p.precio * pd.cantidad) AS DECIMAL(10,2)) AS subtotal
        FROM pedido_detalles pd
        JOIN platillos p ON p.id = pd.platillo_id
        WHERE pd.pedido_id = ?
      `;

      db.query(getDetalles, [pedidoId], (err, detalles) => {
        if (err)
          return res.status(500).json({ error: "Error obteniendo detalles" });

        const total = detalles.reduce((sum, d) => sum + Number(d.subtotal), 0);

        return res.json({
          pedido_id: pedidoId,
          nuevo: false,
          detalles,
          total: Number(total.toFixed(2)),
        });
      });
    } else {
      // Crear nuevo pedido
      const insert = `
        INSERT INTO pedidos (mesa_id, usuario_id, fecha, estado, cliente_id)
        VALUES (?, ?, NOW(), 'activo', ?)
      `;
      const clienteFinal = typeof cliente_id === "number" ? cliente_id : null;

      db.query(insert, [mesaId, usuario_id, clienteFinal], (err, result) => {
        if (err) return res.status(500).json({ error: "Error creando pedido" });

        return res.status(201).json({
          pedido_id: result.insertId,
          nuevo: true,
          detalles: [],
          total: 0,
        });
      });
    }
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

// Traer todos los pedidos activos con sus detalles de platillos
router.get("/comandas", adminOCocinero, (req, res) => {
  const pedidosQuery = `
    SELECT p.id AS pedido_id, p.mesa_id, p.estado, p.fecha, u.nombre AS mesero
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.estado = 'activo'
    ORDER BY p.fecha DESC
  `;

  db.query(pedidosQuery, (err, pedidos) => {
    if (err) return res.status(500).json({ error: "Error obteniendo pedidos" });

    if (pedidos.length === 0) return res.json([]);

    const detallesQuery = `
      SELECT pd.pedido_id, pl.nombre AS platillo, pd.cantidad
      FROM pedido_detalles pd
      JOIN platillos pl ON pd.platillo_id = pl.id
      WHERE pd.pedido_id IN (?)
    `;

    const pedidoIds = pedidos.map((p) => p.pedido_id);

    db.query(detallesQuery, [pedidoIds], (err, detalles) => {
      if (err)
        return res.status(500).json({ error: "Error obteniendo detalles" });

      const pedidosConDetalles = pedidos.map((pedido) => {
        const comanda = detalles.filter(
          (d) => d.pedido_id === pedido.pedido_id
        );
        return { ...pedido, comanda };
      });

      res.json(pedidosConDetalles);
    });
  });
});

module.exports = router;
