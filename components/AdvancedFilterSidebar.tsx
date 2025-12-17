
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { ChevronDown, Check, Trash2 } from 'lucide-react';
import { Brand, Category } from '../types';

type FilterKey = 'season' | 'brand' | 'gender' | 'category' | 'sizes' | 'colors';

interface FilterOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
  hex?: string;
  border?: boolean;
}

interface FilterConfig {
  title: string;
  icon: string;
  key: FilterKey;
  options: FilterOption[];
}

interface SelectedFilters {
  season: string[];
  brand: string[];
  gender: string[];
  category: string[];
  sizes: string[];
  colors: string[];
  priceRange: { min: number; max: number };
}

interface AdvancedFilterSidebarProps {
  onFilterChange: (filters: SelectedFilters) => void;
  totalProducts: number;
}

// Static filter options (not managed in Admin yet)
const STATIC_FILTERS = {
  season: {
    title: 'Estação / Coleção',
    icon: '🌤️',
    key: 'season' as FilterKey,
    options: [
      { value: 'verao', label: 'Verão', icon: '☀️', color: '#F59E0B' },
      { value: 'inverno', label: 'Inverno', icon: '❄️', color: '#3B82F6' },
      { value: 'primavera', label: 'Primavera', icon: '🌸', color: '#EC4899' },
      { value: 'outono', label: 'Outono', icon: '🍂', color: '#F97316' }
    ]
  },
  gender: {
    title: 'Gênero',
    icon: '👶',
    key: 'gender' as FilterKey,
    options: [
      { value: 'boy', label: 'Menino', icon: '👦' },
      { value: 'girl', label: 'Menina', icon: '👧' },
      { value: 'unisex', label: 'Unissex', icon: '👶' },
      { value: 'bebe', label: 'Bebê', icon: '🍼' }
    ]
  },
  size: {
    title: 'Tamanho',
    icon: '📐',
    key: 'sizes' as FilterKey,
    options: [
      { value: 'RN', label: 'RN' },
      { value: 'P', label: 'P' },
      { value: 'M', label: 'M' },
      { value: 'G', label: 'G' },
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '4', label: '4' },
      { value: '6', label: '6' },
      { value: '8', label: '8' },
      { value: '10', label: '10' },
      { value: '12', label: '12' },
      { value: '14', label: '14' },
      { value: '16', label: '16' }
    ]
  },
  color: {
    title: 'Cor',
    icon: '🎨',
    key: 'colors' as FilterKey,
    options: [
      { value: 'branco', label: 'Branco', hex: '#FFFFFF', border: true },
      { value: 'preto', label: 'Preto', hex: '#000000' },
      { value: 'azul', label: 'Azul', hex: '#3B82F6' },
      { value: 'rosa', label: 'Rosa', hex: '#EC4899' },
      { value: 'amarelo', label: 'Amarelo', hex: '#F59E0B' },
      { value: 'verde', label: 'Verde', hex: '#10B981' },
      { value: 'vermelho', label: 'Vermelho', hex: '#EF4444' },
      { value: 'cinza', label: 'Cinza', hex: '#6B7280' },
      { value: 'bege', label: 'Bege', hex: '#D4A574' }
    ]
  }
};

export const AdvancedFilterSidebar: React.FC<AdvancedFilterSidebarProps> = ({ onFilterChange, totalProducts }) => {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    season: [],
    brand: [],
    gender: [],
    category: [],
    sizes: [],
    colors: [],
    priceRange: { min: 0, max: 1000 }
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    season: true,
    brand: true,
    gender: true,
    category: true,
    sizes: false,
    colors: false,
    price: true
  });

  // Dynamic data from localStorage (fetched from API)
  const [dynamicBrands, setDynamicBrands] = useState<Brand[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);

  // Fetch dynamic brands and categories on component mount
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        const [brands, categories] = await Promise.all([
          api.getBrands(),
          api.getCategories()
        ]);
        setDynamicBrands(brands.filter(b => b.active !== false));
        setDynamicCategories(categories.filter(c => c.active !== false));
      } catch (e) {
        console.error('Error fetching filter data:', e);
      }
    };
    fetchDynamicData();
  }, []);

  // Build dynamic FILTER_SYSTEM by merging static + dynamic data
  const FILTER_SYSTEM = useMemo(() => {
    const brandOptions = dynamicBrands.map(b => ({
      value: b.slug || b.name.toLowerCase().replace(/\s+/g, '-'),
      label: b.name,
      icon: undefined
    }));

    const categoryOptions = dynamicCategories
      .filter(c => c.type === 'product' || !c.type) // Only product categories
      .map(c => ({
        value: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
        label: c.name,
        icon: c.icon || '📦'
      }));

    return {
      season: STATIC_FILTERS.season,
      brand: {
        title: 'Linha / Marca',
        icon: '⭐',
        key: 'brand' as FilterKey,
        options: brandOptions.length > 0 ? brandOptions : [
          { value: 'premium', label: 'Premium' },
          { value: 'basic', label: 'Básico' }
        ]
      },
      gender: STATIC_FILTERS.gender,
      category: {
        title: 'Categoria',
        icon: '📦',
        key: 'category' as FilterKey,
        options: categoryOptions.length > 0 ? categoryOptions : [
          { value: 'conjuntos', label: 'Conjuntos', icon: '👕' },
          { value: 'camisetas', label: 'Camisetas', icon: '👔' }
        ]
      },
      size: STATIC_FILTERS.size,
      color: STATIC_FILTERS.color
    };
  }, [dynamicBrands, dynamicCategories]);

  // Debounce filter updates
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange(selectedFilters);
    }, 300);
    return () => clearTimeout(timeout);
  }, [selectedFilters, onFilterChange]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFilterToggle = (key: keyof Omit<SelectedFilters, 'priceRange'>, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    setSelectedFilters((prev) => ({
      ...prev,
      priceRange: { min, max }
    }));
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      season: [],
      brand: [],
      gender: [],
      category: [],
      sizes: [],
      colors: [],
      priceRange: { min: 0, max: 1000 }
    };
    setSelectedFilters(emptyFilters);
  };

  // Calculate active filters count
  const activeCount = Object.keys(selectedFilters).reduce((acc, key) => {
    if (key === 'priceRange') {
      return (selectedFilters.priceRange.min > 0 || selectedFilters.priceRange.max < 1000) ? acc + 1 : acc;
    }
    return acc + (selectedFilters[key]?.length || 0);
  }, 0);

  return (
    <div className="w-full lg:w-72 bg-white rounded-xl border border-gray-200 shadow-sm h-full max-h-[calc(100vh-120px)] flex flex-col sticky top-24">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800 text-lg">Filtros</h3>
          {activeCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-500 hover:text-red-700 hover:underline font-semibold flex items-center gap-1"
          >
            <Trash2 size={12} /> Limpar
          </button>
        )}
      </div>

      {/* Filter Sections Container */}
      <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
        {(Object.entries(FILTER_SYSTEM) as [string, FilterConfig][]).map(([key, config]) => {
          // Special Rendering for Color (Grid of Swatches)
          if (key === 'color') {
            return (
              <div key={key} className="border-b border-gray-100 last:border-0">
                <button onClick={() => toggleSection(config.key)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                    <span>{config.icon}</span> {config.title}
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${expandedSections[config.key] ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections[config.key] && (
                  <div className="px-4 pb-4 grid grid-cols-4 gap-2 animate-[slideDown_0.2s_ease-out]">
                    {config.options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleFilterToggle(config.key as FilterKey, opt.value)}
                        className={`flex flex-col items-center gap-1 group p-1 rounded transition-colors ${selectedFilters.colors.includes(opt.value) ? 'bg-gray-50' : ''}`}
                        title={opt.label}
                      >
                        <div
                          className={`w-8 h-8 rounded-full shadow-sm transition-transform ${selectedFilters.colors.includes(opt.value) ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: opt.hex, border: opt.border ? '1px solid #e5e7eb' : 'none' }}
                        >
                          {selectedFilters.colors.includes(opt.value) && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Check size={14} className={opt.hex === '#FFFFFF' ? 'text-black' : 'text-white'} />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 truncate w-full text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Special Rendering for Size (Grid of Buttons)
          if (key === 'size') {
            return (
              <div key={key} className="border-b border-gray-100 last:border-0">
                <button onClick={() => toggleSection(config.key)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                    <span>{config.icon}</span> {config.title}
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${expandedSections[config.key] ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections[config.key] && (
                  <div className="px-4 pb-4 grid grid-cols-4 gap-2 animate-[slideDown_0.2s_ease-out]">
                    {config.options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleFilterToggle(config.key as FilterKey, opt.value)}
                        className={`py-2 rounded border text-xs font-bold transition-all
                               ${selectedFilters.sizes.includes(opt.value)
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'}
                            `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Standard Checkbox Rendering for Others
          return (
            <div key={key} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => toggleSection(config.key)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                  <span>{config.icon}</span> {config.title}
                  {selectedFilters[config.key]?.length > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {selectedFilters[config.key].length}
                    </span>
                  )}
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${expandedSections[config.key] ? 'rotate-180' : ''}`} />
              </button>

              {expandedSections[config.key] && (
                <div className="px-4 pb-4 space-y-1 animate-[slideDown_0.2s_ease-out]">
                  {config.options.map(opt => {
                    const isSelected = selectedFilters[config.key as FilterKey]?.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        onClick={() => handleFilterToggle(config.key as FilterKey, opt.value)}
                        className="flex items-center gap-3 cursor-pointer group hover:bg-blue-50/50 p-2 rounded transition-colors"
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200
                              ${isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary'}
                           `}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <span className={`text-sm flex-1 ${isSelected ? 'text-primary font-medium' : 'text-gray-600'}`}>
                          {opt.label}
                        </span>
                        {opt.icon && <span className="text-sm">{opt.icon}</span>}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Price Range Section */}
        <div className="border-b border-gray-100 last:border-0">
          <button onClick={() => toggleSection('price')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
              <span>💰</span> Faixa de Preço
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${expandedSections['price'] ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections['price'] && (
            <div className="px-4 pb-6 animate-[slideDown_0.2s_ease-out]">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Mínimo</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 mr-1">R$</span>
                    <input
                      type="number"
                      className="w-full bg-transparent outline-none text-sm font-bold text-primary"
                      value={selectedFilters.priceRange.min}
                      onChange={(e) => handlePriceChange(Number(e.target.value), selectedFilters.priceRange.max)}
                    />
                  </div>
                </div>
                <span className="text-gray-300 font-light text-2xl">-</span>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Máximo</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 mr-1">R$</span>
                    <input
                      type="number"
                      className="w-full bg-transparent outline-none text-sm font-bold text-primary"
                      value={selectedFilters.priceRange.max}
                      onChange={(e) => handlePriceChange(selectedFilters.priceRange.min, Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {[
                  { l: 'Até R$ 200', min: 0, max: 200 },
                  { l: 'R$ 200 - R$ 400', min: 200, max: 400 },
                  { l: 'R$ 400 - R$ 600', min: 400, max: 600 },
                  { l: 'Acima de R$ 600', min: 600, max: 1000 },
                ].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handlePriceChange(p.min, p.max)}
                    className="w-full text-left text-xs py-2 px-3 hover:bg-blue-50 rounded text-gray-600 hover:text-primary transition-colors flex justify-between group"
                  >
                    {p.l}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl text-center">
        <span className="text-xs font-bold text-primary">
          {totalProducts} produto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};
