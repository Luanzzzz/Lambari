-- ============================================
-- FIX DEFINITIVO: DELETE de produtos e kits
-- ============================================

-- Ver políticas atuais
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('products', 'kits', 'kit_items')
ORDER BY tablename, cmd;

-- Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Produtos ativos são públicos" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;
DROP POLICY IF EXISTS "Enable all operations for products" ON products;
DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;

DROP POLICY IF EXISTS "Kits ativos são públicos" ON kits;
DROP POLICY IF EXISTS "Anyone can insert kits" ON kits;
DROP POLICY IF EXISTS "Anyone can update kits" ON kits;
DROP POLICY IF EXISTS "Anyone can delete kits" ON kits;
DROP POLICY IF EXISTS "Enable all operations for kits" ON kits;
DROP POLICY IF EXISTS "kits_select_policy" ON kits;
DROP POLICY IF EXISTS "kits_insert_policy" ON kits;
DROP POLICY IF EXISTS "kits_update_policy" ON kits;
DROP POLICY IF EXISTS "kits_delete_policy" ON kits;

DROP POLICY IF EXISTS "Anyone can insert kit_items" ON kit_items;
DROP POLICY IF EXISTS "Anyone can update kit_items" ON kit_items;
DROP POLICY IF EXISTS "Anyone can delete kit_items" ON kit_items;
DROP POLICY IF EXISTS "kit_items_select_policy" ON kit_items;
DROP POLICY IF EXISTS "kit_items_insert_policy" ON kit_items;
DROP POLICY IF EXISTS "kit_items_update_policy" ON kit_items;
DROP POLICY IF EXISTS "kit_items_delete_policy" ON kit_items;

-- Criar políticas NOVAS e corretas

-- ============================================
-- PRODUCTS
-- ============================================
CREATE POLICY "products_select_policy" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "products_insert_policy" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "products_update_policy" ON products
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "products_delete_policy" ON products
  FOR DELETE USING (true);

-- ============================================
-- KITS
-- ============================================
CREATE POLICY "kits_select_policy" ON kits
  FOR SELECT USING (active = true);

CREATE POLICY "kits_insert_policy" ON kits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "kits_update_policy" ON kits
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "kits_delete_policy" ON kits
  FOR DELETE USING (true);

-- ============================================
-- KIT_ITEMS (CASCADE já está no schema)
-- ============================================
CREATE POLICY "kit_items_select_policy" ON kit_items
  FOR SELECT USING (true);

CREATE POLICY "kit_items_insert_policy" ON kit_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "kit_items_update_policy" ON kit_items
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "kit_items_delete_policy" ON kit_items
  FOR DELETE USING (true);

-- Verificar políticas criadas
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'kits', 'kit_items')
ORDER BY tablename, cmd;

SELECT '✅ Políticas de DELETE criadas com sucesso!' as status;

-- Teste rápido de DELETE (opcional - comentar se não quiser testar)
-- DO $$
-- DECLARE
--   test_product_id uuid;
-- BEGIN
--   -- Criar produto de teste
--   INSERT INTO products (name, sku, brand, category, price, cost_price, gender, stock, active)
--   VALUES ('TESTE DELETE', 'TEST-DEL-001', 'Test', 'Test', 10.00, 5.00, 'boy', '{}', true)
--   RETURNING id INTO test_product_id;

--   RAISE NOTICE 'Produto de teste criado: %', test_product_id;

--   -- Tentar deletar
--   DELETE FROM products WHERE id = test_product_id;

--   RAISE NOTICE '✅ DELETE funcionou!';
-- END $$;
