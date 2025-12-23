-- ============================================
-- LAMBARI - Permitir CRUD em Brands, Categories, Kits
-- Temporário para testes - depois restringir ao admin
-- ============================================

-- ============================================
-- BRANDS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Marcas ativas são públicas" ON brands;

-- Recriar política de leitura (marcas ativas são públicas)
CREATE POLICY "Marcas ativas são públicas"
  ON brands FOR SELECT
  USING (active = true);

-- Adicionar políticas de escrita (temporárias)
CREATE POLICY "Qualquer um pode criar marcas (temporário)"
  ON brands FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar marcas (temporário)"
  ON brands FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar marcas (temporário)"
  ON brands FOR DELETE
  USING (true);

-- ============================================
-- CATEGORIES
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Categorias ativas são públicas" ON categories;

-- Recriar política de leitura (categorias ativas são públicas)
CREATE POLICY "Categorias ativas são públicas"
  ON categories FOR SELECT
  USING (active = true);

-- Adicionar políticas de escrita (temporárias)
CREATE POLICY "Qualquer um pode criar categorias (temporário)"
  ON categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar categorias (temporário)"
  ON categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar categorias (temporário)"
  ON categories FOR DELETE
  USING (true);

-- ============================================
-- KITS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Kits ativos são públicos" ON kits;

-- Recriar política de leitura (kits ativos são públicos)
CREATE POLICY "Kits ativos são públicos"
  ON kits FOR SELECT
  USING (active = true);

-- Adicionar políticas de escrita (temporárias)
CREATE POLICY "Qualquer um pode criar kits (temporário)"
  ON kits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar kits (temporário)"
  ON kits FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar kits (temporário)"
  ON kits FOR DELETE
  USING (true);

-- ============================================
-- KIT_ITEMS (relação N:N entre kits e products)
-- ============================================

-- Kit_items não tem RLS habilitado ainda, então não precisa de políticas
-- Mas vamos habilitar para consistência

ALTER TABLE kit_items ENABLE ROW LEVEL SECURITY;

-- Política para leitura (público)
CREATE POLICY "Kit items são públicos"
  ON kit_items FOR SELECT
  USING (true);

-- Políticas de escrita (temporárias)
CREATE POLICY "Qualquer um pode criar kit items (temporário)"
  ON kit_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar kit items (temporário)"
  ON kit_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar kit items (temporário)"
  ON kit_items FOR DELETE
  USING (true);

-- ============================================
-- IMPORTANTE
-- ============================================
-- Essas políticas são TEMPORÁRIAS para desenvolvimento
-- Em produção, devem ser substituídas por políticas que verificam auth.role() = 'admin'
