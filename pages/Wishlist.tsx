import React from 'react';
import { useShop } from '../context/ShopContext';
import { KitCard } from '../components/KitCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { Brand } from '../types';

export const Wishlist: React.FC = () => {
  const { wishlist } = useShop();
  const navigate = useNavigate();
  const [brands, setBrands] = React.useState<Brand[]>([]);

  React.useEffect(() => {
     api.getBrands().then(setBrands);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      <Header 
        categories={[]} 
        onSearch={() => {}} 
        onLoginSuccess={() => {}} 
      />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-primary" />
           </button>
           <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Heart className="fill-red-500 text-red-500" /> 
              Meus Favoritos
           </h1>
        </div>

        {wishlist.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                 <Heart size={48} className="text-red-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Sua lista de desejos está vazia</h2>
              <p className="text-gray-500 mb-6">Salve os kits que você mais gostou para ver depois.</p>
              <Button onClick={() => navigate('/')}>
                 Explorar Catálogo
              </Button>
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map(kit => (
                 <KitCard 
                    key={kit.id} 
                    kit={kit} 
                    onClick={() => {}} 
                    brands={brands}
                 />
              ))}
           </div>
        )}
      </div>

      <Footer />
    </div>
  );
};