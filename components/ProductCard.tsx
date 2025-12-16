import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  // Extract sizes from stock keys since Product type does not have 'sizes' array
  const sizes = Object.keys(product.stock);

  return (
    <div 
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-primary transition-all duration-300 cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        {!product.inStock && (
          <div className="absolute top-2 right-2 z-10 bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded">
            ESGOTADO
          </div>
        )}
        
        <img 
          src={product.images[currentImageIndex]} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {product.images.length > 1 && isHovered && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full text-primary hover:bg-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full text-primary hover:bg-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
          <button className="bg-primary text-white text-sm px-6 py-2 rounded shadow-lg hover:bg-accent hover:text-primary transition-colors font-medium flex items-center gap-2">
            <Eye size={16} />
            Consultar
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-primary font-medium text-base truncate">{product.name}</h3>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-accent font-bold text-lg">{formatPrice(product.price)}</span>
          <div className="flex gap-1">
            {product.colors.slice(0, 3).map((color, idx) => (
              <div 
                key={idx}
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-xs text-gray-400 ml-1">+{product.colors.length - 3}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {sizes.slice(0, 4).map(size => (
            <span key={size} className="text-[10px] text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded">
              {size}
            </span>
          ))}
          {sizes.length > 4 && (
            <span className="text-[10px] text-gray-500 px-1.5 py-0.5">...</span>
          )}
        </div>
      </div>
    </div>
  );
};