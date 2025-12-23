-- ============================================
-- FIX: Permitir DELETE de produtos e kits
-- ============================================

-- === PRODUCTS ===
-- Remover políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

-- Criar política temporária para DELETE (DESENVOLVIMENTO)
-- IMPORTANTE: Em produção, restringir apenas para admins autenticados
CREATE POLICY "Anyone can delete products"
  ON products FOR DELETE
  USING (true);

-- === KITS ===
-- Remover políticas antigas
DROP POLICY IF EXISTS "Anyone can delete kits" ON kits;

-- Criar política temporária para DELETE (DESENVOLVIMENTO)
CREATE POLICY "Anyone can delete kits"
  ON kits FOR DELETE
  USING (true);

-- === KIT_ITEMS ===
-- Como kit_items tem CASCADE, precisa permitir também
DROP POLICY IF EXISTS "Anyone can delete kit_items" ON kit_items;

CREATE POLICY "Anyone can delete kit_items"
  ON kit_items FOR DELETE
  USING (true);

-- Verificar se as políticas foram criadas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'kits', 'kit_items')
  AND cmd = 'DELETE';

-- Log de sucesso
SELECT '✅ Políticas de DELETE atualizadas com sucesso!' as message;
