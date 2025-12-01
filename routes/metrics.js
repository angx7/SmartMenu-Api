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
      SELECT dia, total FROM (
      SELECT DATE(p.fecha) AS dia, 
           SUM(pd.cantidad * pl.precio) AS total
      FROM pedidos p
      JOIN pedido_detalles pd ON pd.pedido_id = p.id
      JOIN platillos pl ON pl.id = pd.platillo_id
      GROUP BY DATE(p.fecha)
      ORDER BY dia DESC
      LIMIT 3
      ) sub
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
          content: `
            Eres un analista de datos. Siempre recibirás datos SQL en formato JSON.
            Debes responder ÚNICAMENTE con JSON válido, sin texto adicional.

            Formato estricto:
            {
              "graficas": [
                {
                  "type": "line" | "bar" | "pie" | "table",
                  "title": string,
                  "labels": [],
                  "values": []
                }
              ]
            }

            Reglas:
            1. El array "graficas" SIEMPRE debe existir.
            2. El campo "type" SIEMPRE debe ser en inglés y singular: "line", "bar", "pie" o "table".
            3. Los títulos SIEMPRE deben ser los siguientes según la data recibida:
              - ventas_por_dia → "Ventas diarias"
              - ventas_por_platillo → "Ventas por platillo"
              - insumos_bajos → "Insumos con stock bajo"
              - meseros_top → "Meseros con más pedidos"
            4. Si algún dataset no está presente, simplemente no lo incluyas.
            5. Las labels y values deben seguir estas reglas:
              - ventas_por_dia: labels = [dia], values = [total]
              - ventas_por_platillo: labels = [platillo], values = [vendidos]
              - insumos_bajos: type="table"; labels=["nombre"], values=[{nombre,stock,stock_minimo}]
              - meseros_top: labels=[mesero], values=[pedidos]
            6. No inventes datos. Usa solamente lo que venga en el JSON de entrada.
            `,
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
