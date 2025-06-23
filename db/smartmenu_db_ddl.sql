-- ===============================
-- Crear la base de datos
-- ===============================
CREATE DATABASE smartmenu_db;
USE smartmenu_db;

-- ===============================
-- 1. Roles y Usuarios
-- ===============================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- ===============================
-- 2. Platillos (Menú)
-- ===============================
CREATE TABLE platillos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE
);

-- ===============================
-- 3. Mesas y Pedidos
-- ===============================
CREATE TABLE mesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero INTEGER UNIQUE NOT NULL
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(100)
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mesa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'pendiente',
    cliente_id INT,
    FOREIGN KEY (mesa_id) REFERENCES mesas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE pedido_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    platillo_id INT NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (platillo_id) REFERENCES platillos(id)
);

CREATE TABLE platillos_insumos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platillo_id INT,
  insumo_id INT,
  cantidad DECIMAL(10,2),
  FOREIGN KEY (platillo_id) REFERENCES platillos(id),
  FOREIGN KEY (insumo_id) REFERENCES insumos(id)
);



-- ===============================
-- 4. Inventario de Insumos
-- ===============================
CREATE TABLE insumos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    stock DECIMAL(10, 2) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    stock_minimo DECIMAL(10, 2)
);

-- ===============================
-- 5. Proveedores
-- ===============================
CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(100)
);

CREATE TABLE insumos_proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    insumo_id INTEGER NOT NULL,
    proveedor_id INTEGER NOT NULL,
    precio DECIMAL(10, 2),
    FOREIGN KEY (insumo_id) REFERENCES insumos(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);
