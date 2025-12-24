
import React, { useState, useEffect, useCallback } from 'react';
import { Kit, Brand } from '../types';
import { api, KitFilters } from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { KitCard } from '../components/KitCard';
import { KitModal } from '../components/KitModal';
import { BannerCarousel } from '../components/BannerCarousel';
import { Filter, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AdvancedFilterSidebar } from '../components/AdvancedFilterSidebar';
import { DEFAULTS } from '../utils/formatters';

interface CatalogProps {
  onLoginSuccess: () => void;
}

export const Catalog: React.FC<CatalogProps> = ({ onLoginSuccess }) => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);

  // Advanced Filters
  const [filters, setFilters] = useState<KitFilters>({
    priceRange: DEFAULTS.PRICE_RANGE
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleFilterChange = useCallback((newFilters: KitFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    api.getBrands().then(setBrands);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      console.log('🔄 Catalog: Carregando kits com filtros:', filters);
      try {
        const data = await api.getKits(filters);
        console.log('🔍 Catalog: Kits carregados:', data?.length);
        console.log('📊 Catalog: Total de kits:', data?.length);

        // Verificar se algum kit perdeu images/videos
        data?.forEach(kit => {
          if (!kit.images || kit.images.length === 0) {
            console.warn('⚠️ Kit SEM IMAGENS:', kit.id, kit.name);
          }
          if (kit.videos && kit.videos.length > 0) {
            console.log('📹 Kit COM VÍDEOS:', kit.name, kit.videos.length);
          }
        });

        setKits(data);
      } catch (error) {
        console.error("❌ Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    // Tiny debounce/delay to simulate network and prevent flicker
    const timer = setTimeout(loadData, 100);
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      <Header
        categories={[]} // Categories managed internally by filters now
        onSearch={(s) => setFilters(prev => ({ ...prev, search: s }))}
        onLoginSuccess={onLoginSuccess}
      />

      {/* Hero Section */}
      <BannerCarousel />

      <div className="container mx-auto px-4 py-8 flex gap-8 flex-1 relative">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block flex-shrink-0 sticky top-24 h-fit">
          <AdvancedFilterSidebar
            onFilterChange={handleFilterChange}
            totalProducts={kits.length}
          />
        </aside>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden w-full mb-4">
          <Button variant="outline" fullWidth onClick={() => setShowMobileFilters(true)}>
            <Filter size={18} className="mr-2" /> Filtrar Produtos
          </Button>
        </div>

        {/* Kit Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl h-[400px] animate-pulse border border-gray-100 shadow-sm">
                  <div className="h-2/3 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : kits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {kits.map(kit => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onClick={setSelectedKit}
                  brands={brands}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Não encontramos kits com os filtros selecionados. Tente ajustar os critérios de busca.
              </p>
              <Button
                variant="ghost"
                onClick={() => setFilters({ priceRange: DEFAULTS.PRICE_RANGE })}
                className="mt-4"
              >
                Limpar Todos os Filtros
              </Button>
            </div>
          )}
        </main>
      </div>

      <Footer />

      <KitModal
        kit={selectedKit}
        isOpen={!!selectedKit}
        onClose={() => setSelectedKit(null)}
        brands={brands}
      />

      {/* Mobile Filters Modal - Reuses the Sidebar Component */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-[slideInRight_0.3s_ease-out]">
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
            <h2 className="text-xl font-bold text-primary">Filtros</h2>
            <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <AdvancedFilterSidebar
              onFilterChange={handleFilterChange}
              totalProducts={kits.length}
            />
          </div>
          <div className="p-4 border-t border-gray-100 bg-white">
            <Button fullWidth onClick={() => setShowMobileFilters(false)}>
              Ver {kits.length} Produtos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
