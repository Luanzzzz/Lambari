
import React, { useState } from 'react';
import { Kit, Brand } from '../types';
import { Eye, ShoppingCart, Heart, Package, Layers } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Button } from './ui/Button';
import { formatPrice, formatInstallment } from '../utils/formatters';

interface KitCardProps {
  kit: Kit;
  onClick: (kit: Kit) => void;
  brands?: Brand[];
}

export const KitCard: React.FC<KitCardProps> = ({ kit, onClick, brands }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const [isAdding, setIsAdding] = useState(false);

  const getBrandDetails = (brandId: string) => {
    const brand = brands?.find(b => b.id === brandId);
    if (!brand) return { name: brandId, color: '#e5e7eb', textColor: '#374151', slug: 'unknown' };
    return { name: brand.name, color: brand.color, textColor: brand.textColor, slug: brand.slug };
  };

  const brandInfo = getBrandDetails(kit.brand);
  const isFavorited = isInWishlist(kit.id);
  const displayImage = kit.images && kit.images.length > 0
    ? kit.images[0]
    : 'https://placehold.co/600x800?text=Sem+Imagem';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(kit);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(kit);
  };

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border border-gray-100"
      onClick={() => onClick(kit)}
    >
      {/* Image Section */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden cursor-pointer">
        <img
          src={displayImage}
          alt={kit.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Overlay Badges (Top-Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <span
            className="text-[10px] font-bold px-3 py-1 rounded shadow-sm uppercase tracking-wider"
            style={{ backgroundColor: brandInfo.color, color: brandInfo.textColor }}
          >
            {brandInfo.name}
          </span>
          <span className="bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm uppercase tracking-wider">
            {kit.gender === 'boy' ? 'Menino' : kit.gender === 'girl' ? 'Menina' : kit.gender === 'bebe' ? 'Bebê' : 'Unissex'}
          </span>
        </div>

        {/* Favorite Button (Top-Right) */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 shadow-md hover:scale-110
            ${isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}
          `}
        >
          <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
        </button>

        {/* View Details Overlay (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
          <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Eye size={14} /> Ver Detalhes
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-bold text-gray-800 text-base leading-tight mb-2 line-clamp-2 h-[40px]" title={kit.name}>
          {kit.name}
        </h3>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
            <Package size={12} className="text-primary" />
            <span>{kit.totalPieces} peças</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
            <Layers size={12} className="text-primary" />
            <span>Variados</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className="text-2xl font-bold text-primary mb-0.5">
            {formatPrice(kit.price)}
          </div>
          <div className="text-xs text-gray-400 font-medium mb-4">
            ou 3x de {formatInstallment(kit.price)} sem juros
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
              onClick={(e) => { e.stopPropagation(); onClick(kit); }}
            >
              Ver Detalhes
            </Button>
            <Button
              variant="primary"
              size="sm"
              className={`flex-1 font-semibold transition-all ${isAdding ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={handleAddToCart}
            >
              {isAdding ? 'Adicionado!' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
