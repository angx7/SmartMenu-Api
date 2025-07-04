require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const clientesRoutes = require("./routes/clients");
const platillosRoutes = require("./routes/platillos");
const pedidosRoutes = require("./routes/pedidos");
const proveedoresRoutes = require("./routes/proveedores");
const insumosRoutes = require("./routes/insumos");
const reportesRoutes = require("./routes/reportes");

const app = express();
app.use(express.json());
app.use("/api", authRoutes); // Ruta: /api/login
app.use("/api/usuarios", usuariosRoutes); // protegido
app.use("/api/clientes", clientesRoutes); // protegido
app.use("/api/platillos", platillosRoutes); // protegido
app.use("/api/pedidos", pedidosRoutes); // protegido
app.use("/api/proveedores", proveedoresRoutes); // protegido
app.use("/api/insumos", insumosRoutes); // protegido
app.use("/api/reportes", reportesRoutes); // protegido

app.route("/").get((req, res) => {
  res.send("Welcome to the Smart Menu API!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
