-- ============================================
-- FIX: Garantir que campos JSONB são arrays
-- ============================================

-- Verificar estado atual dos campos (apenas ids e nomes)
SELECT
  id,
  name,
  images,
  videos
FROM kits
ORDER BY created_at DESC
LIMIT 10;

-- Corrigir campos NULL ou inválidos para arrays vazios
UPDATE kits
SET
  images = CASE
    WHEN images IS NULL THEN '[]'::jsonb
    WHEN jsonb_array_length(images) IS NULL THEN '[]'::jsonb
    ELSE images
  END,
  videos = CASE
    WHEN videos IS NULL THEN '[]'::jsonb
    WHEN jsonb_array_length(videos) IS NULL THEN '[]'::jsonb
    ELSE videos
  END,
  sizes_available = CASE
    WHEN sizes_available IS NULL THEN '[]'::jsonb
    WHEN jsonb_array_length(sizes_available) IS NULL THEN '[]'::jsonb
    ELSE sizes_available
  END,
  colors = CASE
    WHEN colors IS NULL THEN '[]'::jsonb
    WHEN jsonb_array_length(colors) IS NULL THEN '[]'::jsonb
    ELSE colors
  END,
  style = CASE
    WHEN style IS NULL THEN '[]'::jsonb
    WHEN jsonb_array_length(style) IS NULL THEN '[]'::jsonb
    ELSE style
  END;

-- Verificar resultado - contar quantos foram atualizados
SELECT
  COUNT(*) as total_kits,
  COUNT(CASE WHEN jsonb_array_length(images) = 0 THEN 1 END) as kits_sem_imagens,
  COUNT(CASE WHEN jsonb_array_length(videos) = 0 THEN 1 END) as kits_sem_videos
FROM kits;

-- Fazer o mesmo para products
UPDATE products
SET
  images = CASE
    WHEN images IS NULL THEN '[]'::jsonb
    WHEN jsonb_array_length(images) IS NULL THEN '[]'::jsonb
    ELSE images
  END,
  colors = CASE
    WHEN colors IS NULL THEN '[]'::jsonb
    WHEN jsonb_array_length(colors) IS NULL THEN '[]'::jsonb
    ELSE colors
  END;

SELECT '✅ Arrays JSONB corrigidos com sucesso!' as status;
