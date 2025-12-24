-- ============================================
-- CLEANUP: Remover blob URLs inválidos
-- ============================================
-- Blob URLs (blob:http://localhost:3000/...) são temporários
-- e não funcionam após refresh da página.
-- Este script limpa esses dados inválidos.

-- Verificar quais kits têm blob URLs
SELECT id, name,
  images::text LIKE '%blob:%' as has_blob_images,
  videos::text LIKE '%blob:%' as has_blob_videos
FROM kits
WHERE images::text LIKE '%blob:%' OR videos::text LIKE '%blob:%';

-- Limpar blob URLs de imagens em kits
UPDATE kits
SET images = '{}'
WHERE images::text LIKE '%blob:%';

-- Limpar blob URLs de vídeos em kits
UPDATE kits
SET videos = '{}'
WHERE videos::text LIKE '%blob:%';

-- Verificar quais products têm blob URLs
SELECT id, name,
  images::text LIKE '%blob:%' as has_blob_images
FROM products
WHERE images::text LIKE '%blob:%';

-- Limpar blob URLs de imagens em products
UPDATE products
SET images = '{}'
WHERE images::text LIKE '%blob:%';

-- Verificar resultado
SELECT
  (SELECT COUNT(*) FROM kits WHERE images::text LIKE '%blob:%') as kits_com_blob_images,
  (SELECT COUNT(*) FROM kits WHERE videos::text LIKE '%blob:%') as kits_com_blob_videos,
  (SELECT COUNT(*) FROM products WHERE images::text LIKE '%blob:%') as products_com_blob_images;

SELECT '✅ Blob URLs removidos com sucesso! Faça upload novamente das imagens/vídeos.' as status;
