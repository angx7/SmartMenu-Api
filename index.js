require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./config/db");
const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");

const app = express();
app.use(express.json());
app.use("/api", authRoutes); // Ruta: /api/login
app.use("/api/usuarios", usuariosRoutes); // protegido

app.route("/").get((req, res) => {
  res.send("Welcome to the Smart Menu API!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
