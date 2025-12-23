
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ShoppingCart, Heart, ChevronLeft, ChevronRight, Check, Video } from 'lucide-react';
import { Kit, Brand } from '../types';
import { Button } from './ui/Button';
import { useShop } from '../context/ShopContext';
import { formatPrice, formatInstallment } from '../utils/formatters';

interface KitModalProps {
  kit: Kit | null;
  isOpen: boolean;
  onClose: () => void;
  brands?: Brand[];
}

export const KitModal: React.FC<KitModalProps> = ({ kit, isOpen, onClose, brands }) => {
  const { addToCart, setIsCartOpen, toggleWishlist, isInWishlist } = useShop();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // Reset image index when kit changes
  useEffect(() => {
    if (isOpen) setCurrentImageIndex(0);
  }, [isOpen, kit]);

  if (!isOpen || !kit) return null;

  const images = kit.images && kit.images.length > 0 ? kit.images : ['https://placehold.co/600x800?text=Sem+Imagem'];
  const isFavorited = isInWishlist(kit.id);

  const getBrandDetails = (brandId: string) => {
    const brand = brands?.find(b => b.id === brandId);
    if (!brand) return { name: brandId, color: '#e5e7eb', textColor: '#374151' };
    return { name: brand.name, color: brand.color, textColor: brand.textColor };
  };

  const brandInfo = getBrandDetails(kit.brand);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(kit);
    setTimeout(() => {
      setIsAdding(false);
      // onClose(); 
      setIsCartOpen(true);
    }, 600);
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 rounded-full text-gray-500 hover:text-primary transition-colors hover:rotate-90 duration-200 shadow-sm"
        >
          <X size={24} />
        </button>

        {/* LEFT: Image Gallery */}
        <div className="w-full md:w-1/2 bg-gray-50 flex flex-col relative md:h-full">
          <div className="relative flex-1 bg-gray-100 overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={kit.name}
              className="w-full h-full object-contain md:object-cover"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white text-gray-800 shadow-lg transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white text-gray-800 shadow-lg transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="p-4 flex gap-3 overflow-x-auto bg-white border-t border-gray-100 hidden md:flex">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === currentImageIndex ? 'border-primary opacity-100 ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Details & Info */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto bg-white">

          {/* Header Info */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">{kit.name}</h2>

            <div className="flex gap-2 mb-4">
              <span
                className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: brandInfo.color }}
              >
                {brandInfo.name}
              </span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                {kit.gender === 'boy' ? 'Menino' : kit.gender === 'girl' ? 'Menina' : kit.gender === 'bebe' ? 'Bebê' : 'Unissex'}
              </span>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">{formatPrice(kit.price)}</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                ou em até 3x de <span className="text-gray-900">{formatInstallment(kit.price)}</span> sem juros
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
              <span className="text-xl">📦</span>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Quantidade</p>
                <p className="text-sm font-medium text-gray-900">{kit.totalPieces} peças variadas</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
              <span className="text-xl">📏</span>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Tamanhos</p>
                <p className="text-sm font-medium text-gray-900">{kit.sizesAvailable.join(', ')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
              <span className="text-xl">🎨</span>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Cores</p>
                <p className="text-sm font-medium text-gray-900">{kit.colors?.join(', ') || 'Sortidas'}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
              <span className="text-xl">🧵</span>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Material</p>
                <p className="text-sm font-medium text-gray-900">{kit.material || 'Algodão Premium'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Descrição Detalhada</h3>
            <div className="text-gray-600 text-sm leading-relaxed space-y-4">
              {kit.description.split('. ').map((sentence, i) => (
                <p key={i}>{sentence}.</p>
              ))}
            </div>
          </div>

          {/* Videos Section */}
          {kit.videos && kit.videos.length > 0 && (
            <div className="mb-8 border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                <Video size={16} className="text-purple-600" />
                Vídeos do Kit ({kit.videos.length})
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {kit.videos.map((videoUrl, index) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-xl overflow-hidden border-2 border-purple-100 shadow-sm">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-cover"
                      preload="metadata"
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Seu navegador não suporta vídeos.
                    </video>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="mt-auto pt-6 flex gap-3 border-t border-gray-100">
            <button
              onClick={() => toggleWishlist(kit)}
              className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2
                   ${isFavorited
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                `}
            >
              <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
              {isFavorited ? 'Favorito' : 'Favoritar'}
            </button>

            <button
              onClick={handleAddToCart}
              className={`flex-[2] py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all
                   ${isAdding ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary-light'}
                `}
            >
              {isAdding ? <Check size={20} /> : <ShoppingCart size={20} />}
              {isAdding ? 'Adicionado!' : 'Adicionar ao Carrinho'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
