// require("dotenv").config();
// const express = require("express");
// const authRoutes = require("./routes/auth");
// const usuariosRoutes = require("./routes/usuarios");
// const clientesRoutes = require("./routes/clients");
// const platillosRoutes = require("./routes/platillos");
// const pedidosRoutes = require("./routes/pedidos");
// const proveedoresRoutes = require("./routes/proveedores");
// const insumosRoutes = require("./routes/insumos");
// const reportesRoutes = require("./routes/reportes");
// import metricsRoutes from "./routes/metrics.js";

// const app = express();
// app.use(express.json());
// app.use("/api", authRoutes); // Ruta: /api/login
// app.use("/api/usuarios", usuariosRoutes); // protegido
// app.use("/api/clientes", clientesRoutes); // protegido
// app.use("/api/platillos", platillosRoutes); // protegido
// app.use("/api/pedidos", pedidosRoutes); // protegido
// app.use("/api/proveedores", proveedoresRoutes); // protegido
// app.use("/api/insumos", insumosRoutes); // protegido
// app.use("/api/reportes", reportesRoutes); // protegido
// app.use("/api/metrics", metricsRoutes);

// app.route("/").get((req, res) => {
//   res.send("Welcome to the Smart Menu API!");
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
import dotenv from "dotenv";
dotenv.config();

import express from "express";

// Importa TODAS tus rutas como módulos ESM
import authRoutes from "./routes/auth.js";
import usuariosRoutes from "./routes/usuarios.js";
import clientesRoutes from "./routes/clients.js";
import platillosRoutes from "./routes/platillos.js";
import pedidosRoutes from "./routes/pedidos.js";
import proveedoresRoutes from "./routes/proveedores.js";
import insumosRoutes from "./routes/insumos.js";
import reportesRoutes from "./routes/reportes.js";
import metricsRoutes from "./routes/metrics.js";

const app = express();
app.use(express.json());

// Registrar rutas
app.use("/api", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/platillos", platillosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/insumos", insumosRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/metrics", metricsRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Smart Menu API :D!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
