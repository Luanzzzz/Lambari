-- ============================================
-- FIX: Garantir que campos TEXT[] não são NULL
-- Os campos são TEXT[] (PostgreSQL array), não JSONB
-- ============================================

-- Verificar estado atual dos campos em kits
SELECT
  id,
  name,
  images,
  videos,
  array_length(images, 1) as num_images,
  array_length(videos, 1) as num_videos
FROM kits
ORDER BY created_at DESC
LIMIT 10;

-- Corrigir campos NULL para arrays vazios em KITS
UPDATE kits
SET
  images = COALESCE(images, '{}'),
  videos = COALESCE(videos, '{}'),
  sizes_available = COALESCE(sizes_available, '{}'),
  colors = COALESCE(colors, '{}'),
  style = COALESCE(style, '{}')
WHERE
  images IS NULL
  OR videos IS NULL
  OR sizes_available IS NULL
  OR colors IS NULL
  OR style IS NULL;

-- Verificar resultado
SELECT
  COUNT(*) as total_kits,
  COUNT(CASE WHEN array_length(images, 1) IS NULL OR array_length(images, 1) = 0 THEN 1 END) as kits_sem_imagens,
  COUNT(CASE WHEN array_length(videos, 1) IS NULL OR array_length(videos, 1) = 0 THEN 1 END) as kits_sem_videos
FROM kits;

-- Corrigir campos NULL para arrays vazios em PRODUCTS
UPDATE products
SET
  images = COALESCE(images, '{}'),
  colors = COALESCE(colors, '{}')
WHERE
  images IS NULL
  OR colors IS NULL;

SELECT '✅ Arrays TEXT[] corrigidos com sucesso!' as status;
