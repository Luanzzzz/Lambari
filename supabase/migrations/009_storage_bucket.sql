-- ============================================
-- STORAGE: Criar bucket para mídia
-- ============================================

-- Criar bucket para imagens e vídeos (50MB limite)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,  -- 50MB limite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 52428800;

-- Política: Acesso público para leitura (visualizar imagens/vídeos no site)
CREATE POLICY "Public Access for media" ON storage.objects
FOR SELECT
USING (bucket_id = 'media');

-- Política: Permitir uploads (para painel admin)
CREATE POLICY "Allow uploads to media" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'media');

-- Política: Permitir atualização
CREATE POLICY "Allow update in media" ON storage.objects
FOR UPDATE
USING (bucket_id = 'media');

-- Política: Permitir exclusão (para remover arquivos)
CREATE POLICY "Allow delete from media" ON storage.objects
FOR DELETE
USING (bucket_id = 'media');

SELECT '✅ Bucket de mídia criado com sucesso!' as status;
