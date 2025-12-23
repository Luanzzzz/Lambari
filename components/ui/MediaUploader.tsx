import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Video, Star, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { uploadFile, isBlobUrl } from '../../services/storage';

interface MediaUploaderProps {
  files: string[];
  onFilesChange: (files: string[]) => void;
  type?: 'image' | 'video';
  maxFiles?: number;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  files,
  onFilesChange,
  type = 'image',
  maxFiles = 6
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setUploadError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploading(true);
      const uploadedUrls: string[] = [];
      const folder = type === 'image' ? 'images' : 'videos';

      // Limitar quantidade de arquivos
      const filesToUpload = Array.from(e.dataTransfer.files).slice(0, maxFiles - files.length);

      for (const file of filesToUpload) {
        const result = await uploadFile(file, folder);
        if (result.url) {
          uploadedUrls.push(result.url);
        } else if (result.error) {
          setUploadError(result.error);
        }
      }

      if (uploadedUrls.length > 0) {
        onFilesChange([...files, ...uploadedUrls]);
      }

      setIsUploading(false);
    }
  }, [files, maxFiles, onFilesChange, type]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setIsUploading(true);
    setUploadError(null);

    const file = e.target.files[0];
    const folder = type === 'image' ? 'images' : 'videos';

    const result = await uploadFile(file, folder);

    if (result.url) {
      onFilesChange([...files, result.url]);
    } else if (result.error) {
      setUploadError(result.error);
    }

    setIsUploading(false);
    e.target.value = ''; // Reset input para permitir mesmo arquivo
  }, [files, onFilesChange, type]);

  const addUrl = () => {
    if (!urlInput) return;
    setUploadError(null);

    // Validar se é URL válida
    try {
      new URL(urlInput);
      if (files.length < maxFiles) {
        onFilesChange([...files, urlInput]);
        setUrlInput('');
      }
    } catch {
      setUploadError('URL inválida');
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const setFeatured = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const item = newFiles.splice(index, 1)[0];
    newFiles.unshift(item);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
          {type === 'image' ? <ImageIcon size={16} /> : <Video size={16} />}
          {type === 'image' ? 'Imagens' : 'Vídeos'} ({files.length}/{maxFiles})
        </h4>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Opcional</span>
      </div>

      {/* Erro de upload */}
      {uploadError && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-center gap-2">
          <X size={14} />
          {uploadError}
          <button onClick={() => setUploadError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Grid of items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {files.map((file, idx) => (
          <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {type === 'image' ? (
              <img
                src={file}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback para imagens que não carregam
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Erro';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                <Video size={24} />
              </div>
            )}

            {/* Indicador de blob URL (temporário) */}
            {isBlobUrl(file) && (
              <div className="absolute top-1 left-1 bg-yellow-500 text-white text-[8px] px-1 rounded">
                Temporário
              </div>
            )}

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-end">
                <button
                  onClick={() => removeFile(idx)}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex justify-center">
                {idx === 0 ? (
                  <span className="text-xs bg-yellow-400 text-black font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star size={10} fill="black" /> Principal
                  </span>
                ) : (
                  <button
                    onClick={() => setFeatured(idx)}
                    className="text-xs bg-white text-gray-800 font-medium px-2 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    Definir Principal
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {files.length < maxFiles && (
          <div
            className={`relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors aspect-square
              ${isDragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
              ${isUploading ? 'pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && document.getElementById(`upload-${type}`)?.click()}
          >
            <input
              id={`upload-${type}`}
              type="file"
              accept={type === 'image' ? "image/*" : "video/*"}
              className="hidden"
              onChange={handleFileInput}
              disabled={isUploading}
            />

            {isUploading ? (
              <>
                <Loader2 size={24} className="text-primary animate-spin mb-2" />
                <span className="text-xs text-gray-500 font-medium">Enviando...</span>
              </>
            ) : (
              <>
                <Plus size={24} className="text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 font-medium">Adicionar</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* URL Input Fallback */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={`Ou cole uma URL de ${type}...`}
          className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 outline-none focus:border-primary"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addUrl()}
          disabled={isUploading}
        />
        <Button size="sm" variant="secondary" onClick={addUrl} type="button" disabled={isUploading}>
          Adicionar
        </Button>
      </div>
    </div>
  );
};
