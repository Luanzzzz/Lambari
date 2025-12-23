-- ============================================
-- LAMBARI - Permitir CRUD em Stock Movements, Sellers, Orders, Banners
-- Temporário para testes - depois restringir ao admin
-- ============================================

-- ============================================
-- STOCK_MOVEMENTS
-- ============================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Movimentações de estoque são públicas" ON stock_movements;

-- Política de leitura (público)
CREATE POLICY "Movimentações de estoque são públicas"
  ON stock_movements FOR SELECT
  USING (true);

-- Políticas de escrita (temporárias)
CREATE POLICY "Qualquer um pode criar movimentações (temporário)"
  ON stock_movements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar movimentações (temporário)"
  ON stock_movements FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar movimentações (temporário)"
  ON stock_movements FOR DELETE
  USING (true);

-- ============================================
-- SELLERS
-- ============================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Vendedores ativos são públicos" ON sellers;

-- Recriar política de leitura (vendedores ativos são públicos)
CREATE POLICY "Vendedores ativos são públicos"
  ON sellers FOR SELECT
  USING (active = true);

-- Políticas de escrita (temporárias)
CREATE POLICY "Qualquer um pode criar vendedores (temporário)"
  ON sellers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar vendedores (temporário)"
  ON sellers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar vendedores (temporário)"
  ON sellers FOR DELETE
  USING (true);

-- ============================================
-- ORDERS
-- ============================================

-- Habilitar RLS se ainda não estiver
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política de leitura (público)
CREATE POLICY "Pedidos são públicos"
  ON orders FOR SELECT
  USING (true);

-- Políticas de escrita (temporárias)
CREATE POLICY "Qualquer um pode criar pedidos (temporário)"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar pedidos (temporário)"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar pedidos (temporário)"
  ON orders FOR DELETE
  USING (true);

-- ============================================
-- ORDER_ITEMS
-- ============================================

-- Habilitar RLS se ainda não estiver
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Política de leitura (público)
CREATE POLICY "Items de pedidos são públicos"
  ON order_items FOR SELECT
  USING (true);

-- Políticas de escrita (temporárias)
CREATE POLICY "Qualquer um pode criar items de pedidos (temporário)"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar items de pedidos (temporário)"
  ON order_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar items de pedidos (temporário)"
  ON order_items FOR DELETE
  USING (true);

-- ============================================
-- BANNERS
-- ============================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Banners ativos são públicos" ON banners;

-- Recriar política de leitura (banners ativos são públicos)
CREATE POLICY "Banners ativos são públicos"
  ON banners FOR SELECT
  USING (active = true);

-- Políticas de escrita (temporárias)
CREATE POLICY "Qualquer um pode criar banners (temporário)"
  ON banners FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar banners (temporário)"
  ON banners FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar banners (temporário)"
  ON banners FOR DELETE
  USING (true);

-- ============================================
-- IMPORTANTE
-- ============================================
-- Essas políticas são TEMPORÁRIAS para desenvolvimento
-- Em produção, devem ser substituídas por políticas que verificam auth.role() = 'admin'
