-- ============================================
-- LAMBARI - Permitir INSERT/UPDATE/DELETE em Products
-- Temporário para testes - depois restringir ao admin
-- ============================================

-- Remover políticas restritivas antigas (se existirem)
DROP POLICY IF EXISTS "Produtos ativos são públicos" ON products;

-- Recriar política de leitura (produtos ativos são públicos)
CREATE POLICY "Produtos ativos são públicos"
  ON products FOR SELECT
  USING (active = true);

-- Adicionar política para permitir INSERT em products
CREATE POLICY "Qualquer um pode criar produtos (temporário)"
  ON products FOR INSERT
  WITH CHECK (true);

-- Adicionar política para permitir UPDATE em products
CREATE POLICY "Qualquer um pode atualizar produtos (temporário)"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Adicionar política para permitir DELETE em products
CREATE POLICY "Qualquer um pode deletar produtos (temporário)"
  ON products FOR DELETE
  USING (true);

-- IMPORTANTE: Essas políticas são TEMPORÁRIAS para desenvolvimento
-- Em produção, devem ser substituídas por políticas que verificam auth.role() = 'admin'
