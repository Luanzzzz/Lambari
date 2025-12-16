
import React from 'react';
import { X, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Button } from './ui/Button';
import { formatPrice } from '../utils/formatters';

export const CartSidebar: React.FC = () => {
   const {
      cart,
      isCartOpen,
      setIsCartOpen,
      removeFromCart,
      updateQuantity,
      cartTotal,
      checkoutWhatsApp
   } = useShop();

   if (!isCartOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex justify-end">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
         />

         {/* Sidebar */}
         <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]">

            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
               <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                     <ShoppingBag size={24} />
                  </div>
                  <div>
                     <h2 className="font-bold text-lg text-gray-900">Seu Carrinho</h2>
                     <p className="text-xs text-gray-500">{cart.length} itens adicionados</p>
                  </div>
               </div>
               <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
               >
                  <X size={24} />
               </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
               {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-6">
                     <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
                        <ShoppingBag size={48} className="text-gray-400" />
                     </div>
                     <div>
                        <p className="text-xl font-bold text-gray-600 mb-2">O carrinho está vazio</p>
                        <p className="text-sm max-w-[200px] mx-auto">Explore nosso catálogo para adicionar os melhores kits infantis.</p>
                     </div>
                     <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                        Voltar para Loja
                     </Button>
                  </div>
               ) : (
                  cart.map(item => (
                     <div key={item.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                           <img
                              src={item.images[0] || 'https://placehold.co/100x100?text=No+Img'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                           />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                           <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight max-w-[180px]">{item.name}</h4>
                              <button
                                 onClick={() => removeFromCart(item.id)}
                                 className="text-gray-300 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>

                           <p className="text-xs text-gray-500 mb-2">{item.totalPieces} peças • Ref: {item.id}</p>

                           <div className="flex justify-between items-end">
                              <div className="font-bold text-primary text-lg">
                                 {formatPrice(item.price * item.quantity)}
                              </div>

                              <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                 <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded shadow-sm text-gray-600 transition-colors"
                                    disabled={item.quantity <= 1}
                                 >
                                    -
                                 </button>
                                 <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                 <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded shadow-sm text-gray-600 transition-colors"
                                 >
                                    +
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
               <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-20">
                  <div className="flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">Total do Pedido</span>
                        <span className="text-xs text-gray-400">{cart.reduce((a, b) => a + b.quantity, 0)} kits</span>
                     </div>
                     <span className="text-3xl font-bold text-primary">{formatPrice(cartTotal)}</span>
                  </div>

                  <div className="space-y-3">
                     <Button
                        fullWidth
                        size="lg"
                        onClick={checkoutWhatsApp}
                        className="flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 bg-green-600 hover:bg-green-700 py-4"
                     >
                        <MessageCircle size={24} />
                        <span>Finalizar no WhatsApp</span>
                     </Button>

                     <p className="text-[10px] text-center text-gray-400 mt-2">
                        Ao finalizar, você será redirecionado para falar com um vendedor.
                     </p>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};
