
import React, { useState, useEffect } from 'react';
import { Product, Brand, GenderType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MediaUploader } from '../../components/ui/MediaUploader';
import { Save, X, Info, Tag, DollarSign, Package, Image as ImageIcon, Plus, Trash2, Check, Calculator } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onClose: () => void;
  onSuccess: () => void;
}

const TABS = [
  { id: 'info', label: 'Básico', icon: Info },
  { id: 'category', label: 'Categorização', icon: Tag },
  { id: 'price', label: 'Precificação', icon: DollarSign },
  { id: 'media', label: 'Mídia', icon: ImageIcon },
  { id: 'stock', label: 'Estoque', icon: Package },
];

const PRESET_COLORS = [
  { color: '#000000', text: '#FFFFFF', label: 'Preto' },
  { color: '#FFFFFF', text: '#000000', label: 'Branco' },
  { color: '#EF4444', text: '#FFFFFF', label: 'Vermelho' },
  { color: '#3B82F6', text: '#FFFFFF', label: 'Azul' },
  { color: '#10B981', text: '#FFFFFF', label: 'Verde' },
  { color: '#8B5CF6', text: '#FFFFFF', label: 'Roxo' },
  { color: '#F59E0B', text: '#000000', label: 'Laranja' },
  { color: '#EC4899', text: '#FFFFFF', label: 'Rosa' },
];

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Quick Brand Add State
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandColor, setNewBrandColor] = useState(PRESET_COLORS[0]);
  
  // Profit Calculation State
  const [marginInput, setMarginInput] = useState<string>('');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    sku: '',
    brand: 'premium',
    gender: 'unisex',
    categoryId: '1',
    price: 0,
    costPrice: 0,
    isPromo: false,
    promoPrice: 0,
    images: [],
    stock: { '4': 0, '6': 0, '8': 0 },
    active: true,
    featured: false,
    subcategory: '',
    ...initialData
  });

  useEffect(() => {
    api.getBrands().then(setBrands);
    // Initialize margin input
    if (initialData?.price && initialData?.costPrice) {
       const margin = ((initialData.price - initialData.costPrice) / initialData.price) * 100;
       setMarginInput(margin.toFixed(1));
    }
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 3) newErrors.name = "Nome deve ter min 3 chars";
    if (!formData.price || formData.price <= 0) newErrors.price = "Preço obrigatório";
    if (!formData.costPrice || formData.costPrice <= 0) newErrors.costPrice = "Custo obrigatório";
    if (formData.isPromo && (!formData.promoPrice || formData.promoPrice >= (formData.price || 0))) {
      newErrors.promoPrice = "Preço promo deve ser menor que o original";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePriceFromMargin = (cost: number, margin: number) => {
    if (margin >= 100 || margin < 0) return 0;
    return cost / (1 - (margin / 100));
  };

  const calculateMarginFromPrice = (cost: number, price: number) => {
    if (price <= 0) return 0;
    return ((price - cost) / price) * 100;
  };

  const handleCostChange = (val: number) => {
    setFormData(prev => {
        const newData = { ...prev, costPrice: val };
        // Recalculate price if margin is set, OR recalculate margin if price is set? 
        // Let's keep price steady and update margin usually, unless user specifically uses the margin input.
        if (prev.price && prev.price > 0) {
            const newMargin = calculateMarginFromPrice(val, prev.price);
            setMarginInput(newMargin.toFixed(1));
        }
        return newData;
    });
  };

  const handlePriceChange = (val: number) => {
    setFormData(prev => {
        const newData = { ...prev, price: val };
        if (prev.costPrice && prev.costPrice > 0) {
            const newMargin = calculateMarginFromPrice(prev.costPrice, val);
            setMarginInput(newMargin.toFixed(1));
        }
        return newData;
    });
  };

  const handleMarginChange = (val: string) => {
    setMarginInput(val);
    const margin = parseFloat(val);
    if (!isNaN(margin) && formData.costPrice && formData.costPrice > 0) {
        const newPrice = calculatePriceFromMargin(formData.costPrice, margin);
        setFormData(prev => ({ ...prev, price: parseFloat(newPrice.toFixed(2)) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Corrija os erros antes de salvar");
      return;
    }

    setLoading(true);
    try {
      if (formData.id) {
        await api.updateProduct(formData.id, formData);
        toast.success("Produto atualizado!");
      } else {
        if (!formData.sku) {
            formData.sku = `PROD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        }
        await api.createProduct(formData as Product);
        toast.success("Produto criado!");
      }
      onSuccess();
    } catch (e) {
      toast.error("Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreateBrand = async () => {
    if (!newBrandName || newBrandName.length < 2) {
      toast.error("Nome da marca inválido");
      return;
    }

    try {
      const newBrand = await api.createBrand({
        name: newBrandName,
        color: newBrandColor.color,
        textColor: newBrandColor.text,
        active: true,
        order: brands.length + 1
      });
      
      setBrands([...brands, newBrand]);
      setFormData({ ...formData, brand: newBrand.id });
      setShowBrandModal(false);
      setNewBrandName('');
      toast.success("Marca adicionada e selecionada!");
    } catch (e) {
      toast.error("Erro ao criar marca");
    }
  };

  const updateStock = (size: string, qty: number) => {
    const newStock = { ...formData.stock, [size]: qty };
    setFormData({ ...formData, stock: newStock });
  };

  const removeSize = (size: string) => {
    const newStock = { ...formData.stock };
    delete newStock[size];
    setFormData({ ...formData, stock: newStock });
  };

  const addSize = () => {
    const sizes = ['RN', 'P', 'M', 'G', '1', '2', '4', '6', '8', '10', '12', '14', '16'];
    const used = Object.keys(formData.stock || {});
    const next = sizes.find(s => !used.includes(s));
    if (next) updateStock(next, 0);
  };

  // Helper for Margin Color
  const getMarginColor = () => {
      const m = parseFloat(marginInput);
      if (isNaN(m)) return 'text-gray-500';
      if (m < 20) return 'text-red-500 bg-red-50';
      if (m < 35) return 'text-yellow-600 bg-yellow-50';
      return 'text-green-600 bg-green-50';
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div>
             <h3 className="font-bold text-xl text-primary">{formData.id ? 'Editar Produto' : 'Novo Produto'}</h3>
             <p className="text-sm text-gray-500">Preencha as informações detalhadas do catálogo.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
           {TABS.map(tab => {
             const Icon = tab.icon;
             const isActive = activeTab === tab.id;
             const hasError = (tab.id === 'info' && errors.name) || (tab.id === 'price' && (errors.price || errors.costPrice || errors.promoPrice));
             
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors font-medium text-sm
                   ${isActive ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}
                   ${hasError ? 'text-red-500' : ''}
                 `}
               >
                 <Icon size={16} />
                 {tab.label}
                 {hasError && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
               </button>
             );
           })}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
            
            {/* 1. INFO TAB */}
            {activeTab === 'info' && (
              <div className="space-y-6 max-w-2xl">
                 <Input 
                   label="Nome do Produto *" 
                   value={formData.name} 
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   error={errors.name}
                   placeholder="Ex: Conjunto Moletom Dino"
                 />
                 
                 <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="SKU (Código)" 
                      value={formData.sku} 
                      onChange={e => setFormData({...formData, sku: e.target.value})}
                      placeholder="Gerado auto se vazio"
                    />
                    <div className="flex flex-col gap-2 pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.active} 
                              onChange={e => setFormData({...formData, active: e.target.checked})}
                              className="accent-primary w-4 h-4"
                            />
                            <span className="text-sm font-medium">Produto Ativo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.featured} 
                              onChange={e => setFormData({...formData, featured: e.target.checked})}
                              className="accent-accent w-4 h-4"
                            />
                            <span className="text-sm font-medium">Destaque na Home</span>
                        </label>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary h-32 resize-none bg-white"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Detalhes do tecido, caimento, etc..."
                    />
                 </div>
              </div>
            )}

            {/* 2. CATEGORY TAB */}
            {activeTab === 'category' && (
              <div className="space-y-6 max-w-xl">
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Marca / Linha *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {brands.map(b => (
                         <div 
                           key={b.id}
                           onClick={() => setFormData({...formData, brand: b.id})}
                           className={`border rounded-lg p-4 cursor-pointer transition-all flex items-center justify-between
                            ${formData.brand === b.id 
                                ? 'border-primary bg-blue-50 ring-1 ring-primary' 
                                : 'border-gray-200 hover:border-primary/50'}`}
                         >
                            <span className="font-bold block" style={{ color: formData.brand === b.id ? '#003366' : 'inherit' }}>
                                {b.name}
                            </span>
                            <div 
                                className="w-4 h-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: b.color }}
                            />
                         </div>
                       ))}
                       
                       {/* NEW: Create Brand Button */}
                       <button
                         type="button"
                         onClick={() => setShowBrandModal(true)}
                         className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer transition-colors hover:border-primary hover:bg-blue-50 text-gray-500 hover:text-primary flex items-center justify-center gap-2 font-medium"
                       >
                         <Plus size={20} />
                         Nova Marca/Linha
                       </button>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Gênero *</label>
                    <div className="flex gap-4">
                       {(['boy', 'girl', 'unisex'] as GenderType[]).map(g => (
                         <button
                           key={g}
                           type="button"
                           onClick={() => setFormData({...formData, gender: g})}
                           className={`flex-1 py-2 px-4 rounded border transition-colors capitalize
                             ${formData.gender === g ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
                           `}
                         >
                            {g === 'boy' ? 'Menino' : g === 'girl' ? 'Menina' : 'Unissex'}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Categoria *</label>
                        <select 
                          className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary bg-white"
                          value={formData.categoryId}
                          onChange={e => setFormData({...formData, categoryId: e.target.value})}
                        >
                          <option value="1">Conjuntos</option>
                          <option value="2">Vestidos</option>
                          <option value="3">Pijamas</option>
                          <option value="4">Acessórios</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Subcategoria</label>
                        <select 
                          className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary bg-white"
                          value={formData.subcategory}
                          onChange={e => setFormData({...formData, subcategory: e.target.value})}
                        >
                          <option value="">Selecione...</option>
                          <option value="Verao">Verão</option>
                          <option value="Inverno">Inverno</option>
                          <option value="Escola">Escola</option>
                        </select>
                    </div>
                 </div>
              </div>
            )}

            {/* 3. PRICE TAB */}
            {activeTab === 'price' && (
              <div className="space-y-6 max-w-lg">
                 <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                    <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-4">Calculadora de Lucro</h4>
                    
                    <div>
                       <Input 
                         label="Preço de Custo (R$) *" 
                         type="number"
                         step="0.01"
                         value={formData.costPrice || ''} 
                         onChange={e => handleCostChange(parseFloat(e.target.value))}
                         error={errors.costPrice}
                       />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Margem de Lucro (%)</label>
                        <div className="flex gap-2 items-center">
                            <input 
                                type="number" 
                                className="flex-1 px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary bg-white"
                                placeholder="Ex: 40"
                                value={marginInput}
                                onChange={e => handleMarginChange(e.target.value)}
                            />
                            <div className={`px-3 py-2 rounded text-sm font-bold ${getMarginColor()}`}>
                                {marginInput}%
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                       <Input 
                         label="Preço de Venda (R$) *" 
                         type="number"
                         step="0.01"
                         value={formData.price || ''} 
                         onChange={e => handlePriceChange(parseFloat(e.target.value))}
                         error={errors.price}
                         className="text-lg font-bold"
                       />
                       <p className="text-xs text-gray-500 mt-1 flex justify-between">
                          <span>(Calculado automaticamente)</span>
                          {formData.price && formData.costPrice ? (
                            <span className="font-bold text-green-600">Lucro: R$ {(formData.price - formData.costPrice).toFixed(2)}</span>
                          ) : null}
                       </p>
                    </div>
                 </div>

                 <div className="border border-gray-200 p-4 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input 
                          type="checkbox" 
                          checked={formData.isPromo} 
                          onChange={e => setFormData({...formData, isPromo: e.target.checked})}
                          className="accent-red-500 w-4 h-4"
                        />
                        <span className="font-bold text-red-500">Habilitar Promoção</span>
                    </label>

                    {formData.isPromo && (
                        <div className="animate-[fadeIn_0.2s_ease-out]">
                             <Input 
                                label="Preço Promocional (R$)" 
                                type="number"
                                step="0.01"
                                value={formData.promoPrice || ''} 
                                onChange={e => setFormData({...formData, promoPrice: parseFloat(e.target.value)})}
                                error={errors.promoPrice}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                * O produto aparecerá com a tag "Oferta" e o preço antigo riscado.
                            </p>
                        </div>
                    )}
                 </div>
              </div>
            )}

            {/* 4. MEDIA TAB */}
            {activeTab === 'media' && (
               <div>
                  <MediaUploader 
                    files={formData.images || []} 
                    onFilesChange={(files) => setFormData({...formData, images: files})}
                    type="image"
                  />
                  <div className="mt-8 bg-gray-50 p-4 rounded border border-gray-200">
                     <h5 className="font-bold text-sm text-gray-700 mb-2">Dicas de Imagem</h5>
                     <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                        <li>Use formato quadrado (1:1) ou retrato (4:5) para melhor visualização.</li>
                        <li>Fundo branco ou cinza claro destaca o produto.</li>
                        <li>Tamanho máximo recomendado: 2MB.</li>
                        <li>Imagens são opcionais, mas produtos com fotos vendem 40% mais.</li>
                     </ul>
                  </div>
               </div>
            )}

            {/* 5. STOCK TAB */}
            {activeTab === 'stock' && (
               <div>
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-700">Grade de Tamanhos</h4>
                      <Button size="sm" variant="secondary" onClick={addSize} type="button">
                        <Plus size={16} className="mr-2" /> Adicionar Tamanho
                      </Button>
                   </div>

                   <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                         <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="p-3">Tamanho</th>
                                <th className="p-3">Quantidade</th>
                                <th className="p-3">SKU Suffix</th>
                                <th className="p-3 text-right">Ação</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                            {Object.entries(formData.stock || {}).map(([size, qty]) => (
                                <tr key={size}>
                                    <td className="p-3 w-32">
                                        <select 
                                          className="w-full p-2 border border-gray-300 rounded bg-white"
                                          value={size}
                                          onChange={(e) => {
                                              const val = e.target.value;
                                              const qty = formData.stock![size];
                                              removeSize(size);
                                              updateStock(val, qty!);
                                          }}
                                        >
                                            <option value={size}>{size}</option>
                                            {['RN', 'P', 'M', 'G', '1', '2', '4', '6', '8', '10', '12', '14', '16'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <input 
                                          type="number" 
                                          min="0"
                                          className="w-24 p-2 border border-gray-300 rounded bg-white"
                                          value={qty}
                                          onChange={(e) => updateStock(size, parseInt(e.target.value))}
                                        />
                                    </td>
                                    <td className="p-3 text-xs text-gray-400 font-mono">
                                        -{size}
                                    </td>
                                    <td className="p-3 text-right">
                                        <button 
                                          onClick={() => removeSize(size)}
                                          className="text-red-400 hover:text-red-600 p-2"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                      </table>
                      {Object.keys(formData.stock || {}).length === 0 && (
                          <div className="p-8 text-center text-gray-400">
                              Nenhum tamanho adicionado.
                          </div>
                      )}
                   </div>

                   <div className="mt-4 flex justify-end items-center gap-2 text-sm">
                        <span className="text-gray-500">Total em Estoque:</span>
                        <span className="font-bold text-xl text-primary">
                            {Object.values(formData.stock || {}).reduce((a: number, b: number) => a + b, 0)} un
                        </span>
                   </div>
               </div>
            )}
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
           <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
           <Button onClick={handleSubmit} disabled={loading} className="min-w-[150px]">
              {loading ? 'Salvando...' : 'Salvar Produto'}
           </Button>
        </div>
      </div>
    </div>

    {/* Quick Add Brand Modal */}
    {showBrandModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl animate-[fadeIn_0.2s_ease-out]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-primary">Adicionar Marca</h3>
                 <button onClick={() => setShowBrandModal(false)}><X size={20} className="text-gray-400" /></button>
              </div>
              
              <div className="p-6 space-y-4">
                 <Input 
                   label="Nome da Marca *" 
                   value={newBrandName} 
                   onChange={e => setNewBrandName(e.target.value)}
                   placeholder="Ex: Elite"
                   autoFocus
                 />
                 
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Cor do Indicador</label>
                    <div className="grid grid-cols-4 gap-2">
                       {PRESET_COLORS.map(c => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => setNewBrandColor(c)}
                            className={`h-8 w-full rounded border flex items-center justify-center transition-all
                              ${newBrandColor.color === c.color ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'border-gray-200 hover:border-gray-300'}
                            `}
                            style={{ backgroundColor: c.color }}
                            title={c.label}
                          >
                             {newBrandColor.color === c.color && <Check size={14} color={c.text} />}
                          </button>
                       ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">Selecionado: {newBrandColor.label}</p>
                 </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex gap-2">
                 <Button type="button" variant="ghost" fullWidth onClick={() => setShowBrandModal(false)}>Cancelar</Button>
                 <Button fullWidth onClick={handleQuickCreateBrand}>Adicionar</Button>
              </div>
           </div>
        </div>
    )}
    </>
  );
};
