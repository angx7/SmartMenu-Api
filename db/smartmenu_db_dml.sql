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
('Luis Mesero', 'mesero1', 'clave1', 2),
('Ana Cocinera', 'cocinero1', 'clave2', 3);

-- Mesas
INSERT INTO mesas (numero) VALUES (1), (2), (3), (4), (5);

-- Clientes
INSERT INTO clientes (nombre, telefono, correo) VALUES
('Carlos Ramírez', '5511223344', 'carlos@mail.com'),
('Laura Medina', '5522334455', 'laura@mail.com');

-- Insumos
INSERT INTO insumos (nombre, stock, unidad, stock_minimo) VALUES
('Carne de res', 10.0, 'kg', 2.0),
('Pan para hamburguesa', 20.0, 'piezas', 5.0),
('Lechuga', 8.0, 'kg', 1.0),
('Queso', 6.0, 'kg', 2.0),
('Pepperoni', 5.0, 'kg', 1.0),
('Masa para pizza', 10.0, 'kg', 2.0);

-- Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, correo) VALUES
('Proveedor A', 'Carlos López', '5551112222', 'a@proveedor.com'),
('Proveedor B', 'Sofía Ruiz', '5553334444', 'b@proveedor.com');

-- Insumos-Proveedores
INSERT INTO insumos_proveedores (insumo_id, proveedor_id, precio) VALUES
(1, 1, 90.00), -- carne
(2, 1, 6.00),  -- pan
(3, 2, 15.00), -- lechuga
(4, 2, 50.00), -- queso
(5, 2, 70.00), -- pepperoni
(6, 1, 25.00); -- masa

-- Platillos
INSERT INTO platillos (nombre, descripcion, precio, disponible) VALUES
('Hamburguesa con queso', 'Clásica con papas', 120.00, 1),
('Ensalada César', 'Lechuga, queso y crutones', 90.00, 1),
('Pizza pepperoni', 'Masa, queso, pepperoni', 150.00, 1);
ALTER TABLE platillos ADD imagen_url VARCHAR(255);


select * from platillos;

-- Relación platillos e insumos
INSERT INTO platillos_insumos (platillo_id, insumo_id, cantidad) VALUES
(1, 1, 0.15), -- carne
(1, 2, 1),    -- pan
(1, 4, 0.05), -- queso

(2, 3, 0.10), -- lechuga
(2, 4, 0.02), -- queso

(3, 6, 0.30), -- masa
(3, 5, 0.05), -- pepperoni
(3, 4, 0.08); -- queso

-- Pedidos
INSERT INTO pedidos (mesa_id, usuario_id, fecha, estado, cliente_id) VALUES
(1, 2, NOW(), 'servido', 1),
(2, 2, NOW(), 'servido', 2);

-- Detalles de pedidos
INSERT INTO pedido_detalles (pedido_id, platillo_id, cantidad) VALUES
(1, 1, 2), -- 2 hamburguesas
(1, 2, 1), -- 1 ensalada
(2, 3, 1); -- 1 pizza
