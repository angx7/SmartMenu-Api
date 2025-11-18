import express from "express";
import { db } from "../config/db.js";
import { openai } from "../config/openai.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // ============================
    // 1. CONSULTAS SQL REALES
    // ============================

    const [ventasPorDia] = await db.query(`
      SELECT DATE(p.fecha) AS dia, 
             SUM(pd.cantidad * pl.precio) AS total
      FROM pedidos p
      JOIN pedido_detalles pd ON pd.pedido_id = p.id
      JOIN platillos pl ON pl.id = pd.platillo_id
      GROUP BY DATE(p.fecha)
      ORDER BY dia ASC;
    `);

    const [ventasPorPlatillo] = await db.query(`
      SELECT pl.nombre AS platillo,
             SUM(pd.cantidad) AS vendidos
      FROM pedido_detalles pd
      JOIN platillos pl ON pl.id = pd.platillo_id
      GROUP BY pl.nombre
      ORDER BY vendidos DESC;
    `);

    const [insumosBajos] = await db.query(`
      SELECT nombre, stock, stock_minimo
      FROM insumos
      WHERE stock < stock_minimo;
    `);

    const [meserosTop] = await db.query(`
      SELECT u.nombre AS mesero,
             COUNT(*) AS pedidos
      FROM pedidos p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE u.rol_id = 2
      GROUP BY mesero
      ORDER BY pedidos DESC;
    `);

    // ============================
    // 2. PAYLOAD PARA CHATGPT
    // ============================

    const payload = {
      ventas_por_dia: ventasPorDia,
      ventas_por_platillo: ventasPorPlatillo,
      insumos_bajos: insumosBajos,
      meseros_top: meserosTop,
    };

    // ============================
    // 3. LLAMADA A OPENAI → JSON PURO
    // ============================

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un analista. Recibirás datos de SQL y devolverás métricas listas para graficar. La respuesta debe ser SIEMPRE JSON válido con: graficas:[{ tipo, titulo, labels, values }]. Nada de texto adicional.",
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
    });

    // GPT ya regresa JSON, pero por si acaso:
    let resultado;
    try {
      resultado = JSON.parse(completion.choices[0].message.content);
    } catch {
      // Si OpenAI envía texto accidentalmente, lo reparamos
      const fixed = completion.choices[0].message.content.replace(
        /```json|```/g,
        ""
      );
      resultado = JSON.parse(fixed);
    }

    // ============================
    // 4. RESPUESTA FINAL
    // ============================

    res.json({
      ok: true,
      data: resultado,
    });
  } catch (error) {
    console.error("Error en /api/metrics:", error);
    res.status(500).json({
      ok: false,
      error: "Error generando métricas",
    });
  }
});

export default router;
