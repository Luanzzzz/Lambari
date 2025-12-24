/**
 * Supabase Storage Service
 * Gerencia upload e exclusão de arquivos de mídia (imagens e vídeos)
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'media';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Gera um caminho único para o arquivo
 */
const generateFilePath = (file: File, folder: 'images' | 'videos'): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';

  return `${folder}/${timestamp}-${randomStr}.${extension}`;
};

/**
 * Valida o arquivo antes do upload
 */
const validateFile = (file: File, type: 'image' | 'video'): string | null => {
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (file.size > maxSize) {
    return 'Arquivo muito grande. Máximo: 50MB';
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (type === 'image' && !isImage) {
    return 'Tipo de arquivo inválido. Envie uma imagem.';
  }
  if (type === 'video' && !isVideo) {
    return 'Tipo de arquivo inválido. Envie um vídeo.';
  }

  return null;
};

/**
 * Faz upload de um arquivo para o Supabase Storage
 */
export const uploadFile = async (
  file: File,
  folder: 'images' | 'videos' = 'images'
): Promise<UploadResult> => {
  try {
    // Validar arquivo
    const validationError = validateFile(file, folder === 'images' ? 'image' : 'video');
    if (validationError) {
      return { url: '', path: '', error: validationError };
    }

    const filePath = generateFilePath(file, folder);

    console.log(`📤 Iniciando upload: ${file.name} -> ${filePath}`);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('❌ Erro no upload:', error);
      return { url: '', path: '', error: error.message };
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    console.log(`✅ Upload concluído: ${publicUrlData.publicUrl}`);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error('❌ Exceção no upload:', err);
    return { url: '', path: '', error: err.message || 'Falha no upload' };
  }
};

/**
 * Faz upload de múltiplos arquivos
 */
export const uploadMultipleFiles = async (
  files: File[],
  folder: 'images' | 'videos' = 'images',
  onProgress?: (completed: number, total: number) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i], folder);
    results.push(result);
    onProgress?.(i + 1, files.length);
  }

  return results;
};

/**
 * Extrai o path do storage a partir de uma URL completa
 */
export const getPathFromUrl = (url: string): string | null => {
  // Formato: https://xxx.supabase.co/storage/v1/object/public/media/images/...
  const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
  return match ? match[1] : null;
};

/**
 * Deleta um arquivo do storage
 */
export const deleteFile = async (url: string): Promise<boolean> => {
  try {
    const path = getPathFromUrl(url);
    if (!path) {
      console.warn('⚠️ Não foi possível extrair path da URL:', url);
      return false;
    }

    console.log(`🗑️ Deletando arquivo: ${path}`);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('❌ Erro ao deletar:', error);
      return false;
    }

    console.log('✅ Arquivo deletado com sucesso');
    return true;
  } catch (err) {
    console.error('❌ Exceção ao deletar:', err);
    return false;
  }
};

/**
 * Verifica se uma URL é um blob URL temporário (inválido após refresh)
 */
export const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

/**
 * Verifica se uma URL é do Supabase Storage
 */
export const isSupabaseStorageUrl = (url: string): boolean => {
  return url.includes('supabase.co/storage/v1/object');
};
