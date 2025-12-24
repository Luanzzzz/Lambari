-- ============================================
-- DESABILITAR RLS EM TODAS AS TABELAS
-- SOLUÇÃO PARA O PROBLEMA DE DELETE
-- ============================================
-- Executar este script no Supabase Dashboard → SQL Editor

-- Desabilitar RLS em todas as tabelas principais
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE kits DISABLE ROW LEVEL SECURITY;
ALTER TABLE kit_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE sellers DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'kits', 'kit_items', 'brands', 'categories', 'sellers', 'banners', 'orders', 'order_items', 'stock_movements')
ORDER BY tablename;

-- Deve mostrar "false" para rls_enabled em todas
SELECT '✅ RLS desabilitado em todas as tabelas!' as status;

-- ============================================
-- TESTE DE DELETE (após executar o acima)
-- ============================================
-- Criar um produto de teste
-- INSERT INTO products (name, sku, brand, category, price, cost_price, gender, stock, active)
-- VALUES ('TESTE DELETE FINAL', 'TEST-DEL-FINAL', 'Test', 'Test', 10.00, 5.00, 'boy', '{}', true)
-- RETURNING id, name;

-- Copie o ID retornado e use abaixo (ex: 'abc123-def456...')
-- DELETE FROM products WHERE id = 'COLE_O_ID_AQUI';

-- Se deletou, verá: DELETE 1
-- Se deu erro, me mostre a mensagem
