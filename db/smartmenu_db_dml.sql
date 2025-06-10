-- ===============================
-- DML - Datos de prueba
-- ===============================

-- Roles
INSERT INTO roles (nombre) VALUES
('administrador'),
('mesero'),
('cocinero');

-- Usuarios
INSERT INTO usuarios (nombre, usuario, contraseña, rol_id) VALUES
('Admin', 'admin', 'admin123', 1),
('Mesero1', 'mesero1', 'clave1', 2),
('Cocinero1', 'cocinero1', 'clave2', 3);

-- Mesas
INSERT INTO mesas (numero) VALUES
(1), (2), (3), (4), (5);

-- Clientes
INSERT INTO clientes (nombre, telefono, correo) VALUES
('Juan Pérez', '5512345678', 'juan@mail.com'),
('Ana Gómez', '5522334455', 'ana@mail.com');

-- Platillos
INSERT INTO platillos (nombre, descripcion, precio) VALUES
('Hamburguesa', 'Con queso y papas', 120.00),
('Ensalada César', 'Lechuga, pollo y aderezo', 90.00),
('Pizza personal', 'Queso y pepperoni', 150.00);

-- Insumos
INSERT INTO insumos (nombre, stock, unidad, stock_minimo) VALUES
('Carne de res', 10.00, 'kg', 2.00),
('Pan para hamburguesa', 20.00, 'piezas', 5.00),
('Lechuga', 5.00, 'kg', 1.00),
('Queso', 8.00, 'kg', 2.00);

-- Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, correo) VALUES
('Proveedor A', 'Carlos Mendoza', '5551234567', 'proveedora@mail.com'),
('Proveedor B', 'Laura Torres', '5557654321', 'proveedorb@mail.com');

-- Relación Insumos-Proveedores
INSERT INTO insumos_proveedores (insumo_id, proveedor_id, precio) VALUES
(1, 1, 80.00),
(2, 1, 5.00),
(3, 2, 20.00),
(4, 2, 50.00);
