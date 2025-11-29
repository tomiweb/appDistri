-- ============================================
-- SCHEMA SQL PARA SUPABASE
-- Sistema de Gestión de Consignación
-- ============================================

-- Eliminar tablas existentes (si las hay)
DROP TABLE IF EXISTS cobros CASCADE;
DROP TABLE IF EXISTS detalle_visitas CASCADE;
DROP TABLE IF EXISTS stock_comercio CASCADE;
DROP TABLE IF EXISTS visitas CASCADE;
DROP TABLE IF EXISTS articulos CASCADE;
DROP TABLE IF EXISTS comercios CASCADE;

-- ============================================
-- TABLA: comercios
-- ============================================
CREATE TABLE comercios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(50),
  contacto VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: articulos
-- ============================================
CREATE TABLE articulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  marca VARCHAR(100),
  categoria VARCHAR(100),
  costo DECIMAL(10, 2) DEFAULT 0,
  precio_gio DECIMAL(10, 2) NOT NULL,
  precio_publico DECIMAL(10, 2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: visitas
-- ============================================
CREATE TABLE visitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comercio_id UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  fecha_visita TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comentarios TEXT,
  total_cobrado DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: detalle_visitas
-- ============================================
CREATE TABLE detalle_visitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visita_id UUID NOT NULL REFERENCES visitas(id) ON DELETE CASCADE,
  articulo_id UUID NOT NULL REFERENCES articulos(id) ON DELETE CASCADE,
  stock_anterior INTEGER DEFAULT 0,
  stock_actual INTEGER DEFAULT 0,
  ventas INTEGER DEFAULT 0,
  reposicion INTEGER DEFAULT 0,
  stock_final INTEGER DEFAULT 0,
  precio_gio_en_visita DECIMAL(10, 2) NOT NULL,
  precio_publico_en_visita DECIMAL(10, 2) NOT NULL,
  importe DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: stock_comercio
-- ============================================
CREATE TABLE stock_comercio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comercio_id UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
  articulo_id UUID NOT NULL REFERENCES articulos(id) ON DELETE CASCADE,
  stock_actual INTEGER DEFAULT 0,
  ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comercio_id, articulo_id)
);

-- ============================================
-- TABLA: cobros
-- ============================================
CREATE TABLE cobros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comercio_id UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
  visita_id UUID REFERENCES visitas(id) ON DELETE SET NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ============================================
CREATE INDEX idx_visitas_comercio ON visitas(comercio_id);
CREATE INDEX idx_visitas_fecha ON visitas(fecha_visita);
CREATE INDEX idx_detalle_visitas_visita ON detalle_visitas(visita_id);
CREATE INDEX idx_detalle_visitas_articulo ON detalle_visitas(articulo_id);
CREATE INDEX idx_stock_comercio_lookup ON stock_comercio(comercio_id, articulo_id);
CREATE INDEX idx_cobros_comercio ON cobros(comercio_id);
CREATE INDEX idx_cobros_fecha ON cobros(fecha_pago);

-- ============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_comercios_updated_at BEFORE UPDATE ON comercios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articulos_updated_at BEFORE UPDATE ON articulos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitas_updated_at BEFORE UPDATE ON visitas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_detalle_visitas_updated_at BEFORE UPDATE ON detalle_visitas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_comercio_updated_at BEFORE UPDATE ON stock_comercio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cobros_updated_at BEFORE UPDATE ON cobros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS en todas las tablas
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;
ALTER TABLE articulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_comercio ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobros ENABLE ROW LEVEL SECURITY;

-- Políticas: Usuarios autenticados pueden hacer todo
-- (En producción, deberías refinar estas políticas según roles)

-- Políticas para comercios
CREATE POLICY "Usuarios autenticados pueden ver comercios"
  ON comercios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar comercios"
  ON comercios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar comercios"
  ON comercios FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar comercios"
  ON comercios FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para articulos
CREATE POLICY "Usuarios autenticados pueden ver articulos"
  ON articulos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar articulos"
  ON articulos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar articulos"
  ON articulos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar articulos"
  ON articulos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para visitas
CREATE POLICY "Usuarios autenticados pueden ver visitas"
  ON visitas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar visitas"
  ON visitas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar visitas"
  ON visitas FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar visitas"
  ON visitas FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para detalle_visitas
CREATE POLICY "Usuarios autenticados pueden ver detalle_visitas"
  ON detalle_visitas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar detalle_visitas"
  ON detalle_visitas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar detalle_visitas"
  ON detalle_visitas FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar detalle_visitas"
  ON detalle_visitas FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para stock_comercio
CREATE POLICY "Usuarios autenticados pueden ver stock_comercio"
  ON stock_comercio FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar stock_comercio"
  ON stock_comercio FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar stock_comercio"
  ON stock_comercio FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar stock_comercio"
  ON stock_comercio FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para cobros
CREATE POLICY "Usuarios autenticados pueden ver cobros"
  ON cobros FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar cobros"
  ON cobros FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar cobros"
  ON cobros FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar cobros"
  ON cobros FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- VISTA: Saldo por comercio
-- ============================================
CREATE OR REPLACE VIEW vista_saldo_comercio AS
SELECT
  c.id,
  c.nombre,
  COALESCE(SUM(dv.importe), 0) AS total_ventas,
  COALESCE(SUM(co.monto), 0) AS total_cobrado,
  COALESCE(SUM(dv.importe), 0) - COALESCE(SUM(co.monto), 0) AS saldo_pendiente
FROM comercios c
LEFT JOIN visitas v ON c.id = v.comercio_id
LEFT JOIN detalle_visitas dv ON v.id = dv.visita_id
LEFT JOIN cobros co ON c.id = co.comercio_id
GROUP BY c.id, c.nombre;

-- ============================================
-- FUNCIÓN: Calcular totales de visita
-- ============================================
-- Esta función se puede llamar desde el backend después de guardar los detalles
CREATE OR REPLACE FUNCTION calcular_total_visita(visita_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(importe), 0) INTO total
  FROM detalle_visitas
  WHERE visita_id = visita_uuid;

  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL - DESCOMENTAR SI QUIERES)
-- ============================================
-- Insertar algunos comercios de ejemplo
INSERT INTO comercios (nombre, direccion, telefono, contacto, activo) VALUES
('Kiosco El Centro', 'Av. Principal 123', '11-1234-5678', 'Juan Pérez', true),
('Librería San Martín', 'San Martín 456', '11-8765-4321', 'María González', true),
('Bazar Los Andes', 'Los Andes 789', '11-5555-6666', 'Carlos Rodríguez', true);

-- Insertar algunos artículos de ejemplo
INSERT INTO articulos (nombre, marca, categoria, costo, precio_gio, precio_publico, activo) VALUES
('Auriculares In-Ear', 'Karsen', 'Audio', 800.00, 1200.00, 1800.00, true),
('Cable USB-C 1m', 'Genérico', 'Cables', 300.00, 500.00, 800.00, true),
('Mouse Inalámbrico', 'Logitech', 'Periféricos', 1500.00, 2200.00, 3200.00, true),
('Teclado Mecánico', 'Redragon', 'Periféricos', 3000.00, 4500.00, 6500.00, true),
('Cargador Rápido 20W', 'Anker', 'Cargadores', 1200.00, 1800.00, 2500.00, true);
