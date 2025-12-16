import React, { useState } from 'react';
import { X, MessageCircle, Check } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/Button';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [mainImage, setMainImage] = useState<string>('');

  // Reset state when product changes
  React.useEffect(() => {
    if (product) {
      setMainImage(product.images[0]);
      setSelectedSize('');
      setSelectedColor('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleWhatsAppClick = () => {
    const message = `Olá! Vim do catálogo Lambari Kids.%0AProduto: ${product.name}%0ATamanho: ${selectedSize || 'Não selecionado'}%0ACor: ${selectedColor ? 'Selecionada' : 'Não selecionada'}`;
    window.open(`https://wa.me/5511947804855?text=${message}`, '_blank');
  };

  // Extract sizes from stock keys since Product type does not have 'sizes' array
  const sizes = Object.keys(product.stock);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-[800px] animate-[fadeIn_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full text-gray-500 hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        {/* Gallery */}
        <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="aspect-[4/5] w-full bg-white rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={mainImage} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img)}
                className={`w-20 aspect-square rounded border-2 flex-shrink-0 overflow-hidden ${mainImage === img ? 'border-primary' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
          <div className="mb-1">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Ref: {product.id}</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">{product.name}</h2>
          
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-3xl font-bold text-accent">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </span>
            {!product.inStock && (
              <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm font-medium">
                Esgotado
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="space-y-6 flex-1">
            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Cor</label>
              <div className="flex gap-3">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center relative ${selectedColor === color ? 'ring-2 ring-offset-2 ring-primary border-transparent' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && <Check size={14} className={color === '#FFFFFF' ? 'text-black' : 'text-white'} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Tamanho</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 rounded border text-sm font-medium transition-colors
                      ${selectedSize === size 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Button 
              size="lg" 
              fullWidth 
              onClick={handleWhatsAppClick}
              className="group"
            >
              <MessageCircle className="mr-2 group-hover:animate-bounce" size={20} />
              Falar com Vendedora
            </Button>
            <p className="text-xs text-center text-gray-400 mt-3">
              Você será redirecionado para o WhatsApp da loja
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};