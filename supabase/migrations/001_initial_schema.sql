-- ============================================
-- LAMBARI E-COMMERCE - SCHEMA INICIAL
-- Versão: 1.0
-- Data: 2024-12-22
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca fuzzy

-- ============================================
-- TABELA: BRANDS (Marcas)
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT, -- Hex color (ex: #FF5733)
  text_color TEXT, -- Cor do texto para contraste
  active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(active);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

-- ============================================
-- TABELA: CATEGORIES (Categorias)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT, -- 'season' | 'brand' | 'gender' | 'product' | 'product_sub'
  icon TEXT,
  color TEXT,
  description TEXT,
  active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- ============================================
-- TABELA: PRODUCTS (Produtos)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE NOT NULL,

  -- Relacionamentos
  brand TEXT, -- Nome da marca (simplificado)
  category TEXT, -- Nome da categoria
  subcategory TEXT,

  -- Preços
  price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2),
  promo_price NUMERIC(10,2),
  is_promo BOOLEAN DEFAULT false,

  -- Características
  gender TEXT CHECK (gender IN ('boy', 'girl', 'bebe', 'unisex')),

  -- Mídia
  images TEXT[] DEFAULT '{}',
  main_image TEXT,
  colors TEXT[] DEFAULT '{}',

  -- Estoque (JSON: { "P": 10, "M": 5, "G": 0 })
  stock JSONB DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,

  -- Status
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Índice GIN para busca full-text
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- ============================================
-- TABELA: KITS
-- ============================================
CREATE TABLE IF NOT EXISTS kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  total_pieces INTEGER,

  -- Relacionamentos
  brand TEXT,
  gender TEXT CHECK (gender IN ('boy', 'girl', 'bebe', 'unisex')),
  season TEXT, -- 'verao' | 'inverno' | 'primavera' | 'outono' | 'todas'
  age_range TEXT, -- 'rn' | 'baby' | 'toddler' | 'kids' | 'tweens' | 'teens'
  style TEXT[],
  category TEXT,

  -- Disponibilidade
  min_quantity INTEGER,
  availability TEXT, -- 'em_estoque' | 'pronta_entrega' | 'pre_venda' | 'promocao'

  -- Mídia
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',

  -- Características
  sizes_available TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  material TEXT,

  -- Status
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_kits_brand ON kits(brand);
CREATE INDEX IF NOT EXISTS idx_kits_gender ON kits(gender);
CREATE INDEX IF NOT EXISTS idx_kits_active ON kits(active);
CREATE INDEX IF NOT EXISTS idx_kits_name_trgm ON kits USING gin (name gin_trgm_ops);

-- ============================================
-- TABELA: KIT_ITEMS (Produtos dentro dos Kits)
-- Relação N:N entre Kits e Products
-- ============================================
CREATE TABLE IF NOT EXISTS kit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_at_time NUMERIC(10,2),

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(kit_id, product_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_kit_items_kit ON kit_items(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_items_product ON kit_items(product_id);

-- ============================================
-- TABELA: SELLERS (Vendedoras)
-- ============================================
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL, -- Formato: 5511999999999
  email TEXT,
  active BOOLEAN DEFAULT true,
  order_count INTEGER DEFAULT 0, -- Para balanceamento de carga

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sellers_active ON sellers(active);
CREATE INDEX IF NOT EXISTS idx_sellers_order_count ON sellers(order_count);

-- ============================================
-- TABELA: ORDERS (Pedidos)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- Ex: LMB-2024-00123

  -- Dados do Cliente
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT,
  customer_state TEXT,

  -- Vendedora Responsável
  seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,

  -- Financeiro
  subtotal NUMERIC(10,2),
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,

  -- Status
  status TEXT CHECK (status IN (
    'pending_whatsapp',  -- Aguardando contato no WhatsApp
    'confirmed',         -- Cliente confirmou no WhatsApp
    'preparing',         -- Separando produtos
    'shipped',           -- Enviado
    'delivered',         -- Entregue
    'cancelled'          -- Cancelado
  )) DEFAULT 'pending_whatsapp',

  -- Observações
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);

-- ============================================
-- TABELA: ORDER_ITEMS (Itens do Pedido)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Referências (product_id OU kit_id, nunca ambos)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  kit_id UUID REFERENCES kits(id) ON DELETE SET NULL,

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,

  -- Snapshot do item (para preservar dados se produto for deletado)
  item_name TEXT,
  item_ref TEXT, -- SKU do produto ou ID do Kit

  created_at TIMESTAMPTZ DEFAULT now(),

  CHECK (
    (product_id IS NOT NULL AND kit_id IS NULL) OR
    (product_id IS NULL AND kit_id IS NOT NULL)
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_kit ON order_items(kit_id);

-- ============================================
-- TABELA: BANNERS (Banners da Home)
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT, -- URL de destino ao clicar (opcional)
  position INTEGER DEFAULT 0, -- Ordem de exibição (menor = primeiro)
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_banners_active_position ON banners(active, position);

-- ============================================
-- TABELA: STOCK_MOVEMENTS (Histórico de Estoque)
-- ============================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  movement_type TEXT CHECK (movement_type IN ('adjustment', 'sale', 'return', 'import')) NOT NULL,
  quantity_change INTEGER NOT NULL,
  size TEXT,
  user_id TEXT, -- ID do admin que fez a alteração
  reason TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);

-- ============================================
-- SEQUENCE: Para números de pedido
-- ============================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- ============================================
-- FUNÇÃO: Gerar número de pedido
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'LMB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS: Atualizar updated_at
-- ============================================
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kits_updated_at
  BEFORE UPDATE ON kits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Auto-gerar order_number ao criar pedido
-- ============================================
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number = generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Básico
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de LEITURA (área do cliente)
CREATE POLICY "Produtos ativos são públicos"
  ON products FOR SELECT
  USING (active = true);

CREATE POLICY "Kits ativos são públicos"
  ON kits FOR SELECT
  USING (active = true);

CREATE POLICY "Marcas ativas são públicas"
  ON brands FOR SELECT
  USING (active = true);

CREATE POLICY "Categorias ativas são públicas"
  ON categories FOR SELECT
  USING (active = true);

CREATE POLICY "Banners ativos são públicos"
  ON banners FOR SELECT
  USING (active = true);

-- Política para vendedoras (apenas ativas visíveis publicamente)
CREATE POLICY "Vendedoras ativas são públicas"
  ON sellers FOR SELECT
  USING (active = true);

-- Política de ESCRITA (temporariamente liberado - depois restringimos ao admin)
-- IMPORTANTE: Isso permite que qualquer um crie pedidos (necessário para checkout)
CREATE POLICY "Qualquer um pode criar pedidos"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Pedidos são públicos para leitura"
  ON orders FOR SELECT
  USING (true);

-- ============================================
-- VIEWS: Para relatórios e dashboard
-- ============================================

-- View: Produtos com baixo estoque
CREATE OR REPLACE VIEW low_stock_products AS
SELECT
  p.id,
  p.name,
  p.sku,
  p.brand,
  p.stock,
  p.in_stock,
  (SELECT SUM((value::text)::int)
   FROM jsonb_each(p.stock)
   WHERE (value::text)::int > 0) as total_stock
FROM products p
WHERE p.active = true
  AND (SELECT SUM((value::text)::int)
       FROM jsonb_each(p.stock)
       WHERE (value::text)::int > 0) < 10
ORDER BY total_stock ASC;

-- View: Estatísticas de pedidos
CREATE OR REPLACE VIEW order_stats AS
SELECT
  status,
  COUNT(*) as count,
  SUM(total) as total_value,
  AVG(total) as avg_value
FROM orders
GROUP BY status;

-- ============================================
-- COMENTÁRIOS (Documentação)
-- ============================================
COMMENT ON TABLE products IS 'Produtos individuais vendidos na loja';
COMMENT ON TABLE kits IS 'Kits (conjuntos de produtos com desconto)';
COMMENT ON TABLE kit_items IS 'Produtos que compõem cada kit (relação N:N)';
COMMENT ON TABLE orders IS 'Pedidos realizados pelos clientes';
COMMENT ON TABLE sellers IS 'Vendedoras responsáveis pelo atendimento via WhatsApp';
COMMENT ON TABLE banners IS 'Banners exibidos na home (gerenciados pelo admin)';
COMMENT ON TABLE stock_movements IS 'Histórico de movimentações de estoque para auditoria';

-- ============================================
-- FIM DO SCHEMA
-- ============================================
