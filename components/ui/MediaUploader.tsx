import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Video, Star, Trash2, Plus } from 'lucide-react';
import { Button } from './Button';

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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // In a real app, we would upload these files to Cloudinary/S3 here
    // For this demo, we'll create object URLs to simulate uploads
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles: string[] = [];
      Array.from(e.dataTransfer.files).forEach((file: File) => {
        if (files.length + newFiles.length < maxFiles) {
          const fakeUrl = URL.createObjectURL(file); // Simulation
          newFiles.push(fakeUrl);
        }
      });
      onFilesChange([...files, ...newFiles]);
    }
  }, [files, maxFiles, onFilesChange]);

  const addUrl = () => {
    if (!urlInput) return;
    if (files.length < maxFiles) {
      onFilesChange([...files, urlInput]);
      setUrlInput('');
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

      {/* Grid of items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {files.map((file, idx) => (
          <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {type === 'image' ? (
              <img src={file} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                <Video size={24} />
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
            className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors aspect-square
              ${isDragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById(`upload-${type}`)?.click()}
          >
            <input 
              id={`upload-${type}`} 
              type="file" 
              accept={type === 'image' ? "image/*" : "video/*"} 
              className="hidden" 
              onChange={(e) => {
                if(e.target.files?.[0]) {
                    const fakeUrl = URL.createObjectURL(e.target.files[0]);
                    onFilesChange([...files, fakeUrl]);
                }
              }}
            />
            <Plus size={24} className="text-gray-400 mb-2" />
            <span className="text-xs text-gray-500 font-medium">Adicionar</span>
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
        />
        <Button size="sm" variant="secondary" onClick={addUrl} type="button">Adicionar</Button>
      </div>
    </div>
  );
};