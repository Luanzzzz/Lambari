import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Brand } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit2, Trash2, X, Hexagon, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const BrandManager: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<Brand> | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    textColor: '#FFFFFF',
    active: true
  });

  const loadBrands = async () => {
    try {
      const data = await api.getBrands();
      setBrands(data);
    } catch (e) {
      toast.error('Erro ao carregar marcas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        color: brand.color,
        textColor: brand.textColor,
        active: brand.active
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        color: '#000000',
        textColor: '#FFFFFF',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Nome obrigatório');

    try {
      if (editingBrand && editingBrand.id) {
        await api.updateBrand(editingBrand.id, { ...formData });
        toast.success('Marca atualizada!');
      } else {
        await api.createBrand({ ...formData, order: brands.length + 1 });
        toast.success('Marca criada!');
      }
      setIsModalOpen(false);
      loadBrands();
    } catch (e) {
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza? Produtos vinculados podem ficar sem marca.')) {
      await api.deleteBrand(id);
      loadBrands();
      toast.success('Marca excluída');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Gerenciar Marcas</h2>
          <p className="text-gray-500 text-sm">Crie e edite as linhas de produtos disponíveis.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="mr-2" /> Nova Marca
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map(brand => (
          <div key={brand.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative group overflow-hidden">
             {/* Color Banner */}
             <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: brand.color }}></div>
             
             <div className="pl-4">
               <div className="flex justify-between items-start mb-2">
                 <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold shadow-sm"
                    style={{ backgroundColor: brand.color, color: brand.textColor }}
                 >
                    {brand.name.charAt(0)}
                 </div>
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(brand)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                       <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(brand.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                       <Trash2 size={16} />
                    </button>
                 </div>
               </div>

               <h3 className="text-lg font-bold text-gray-900">{brand.name}</h3>
               <p className="text-xs text-gray-400 mb-4">Slug: {brand.slug}</p>
               
               <div className="flex items-center justify-between mt-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${brand.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {brand.active ? 'Ativa' : 'Inativa'}
                  </span>
               </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-xl text-primary">{editingBrand ? 'Editar Marca' : 'Nova Marca'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input 
                label="Nome da Marca *"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Premium Kaine"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-text-secondary mb-1">Cor do Fundo</label>
                   <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.color}
                        onChange={e => setFormData({...formData, color: e.target.value})}
                        className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                      />
                      <input 
                         type="text"
                         value={formData.color}
                         onChange={e => setFormData({...formData, color: e.target.value})}
                         className="w-full text-sm border border-gray-300 rounded px-2 py-2"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-text-secondary mb-1">Cor do Texto</label>
                   <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.textColor}
                        onChange={e => setFormData({...formData, textColor: e.target.value})}
                        className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                      />
                      <input 
                         type="text"
                         value={formData.textColor}
                         onChange={e => setFormData({...formData, textColor: e.target.value})}
                         className="w-full text-sm border border-gray-300 rounded px-2 py-2"
                      />
                   </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center gap-4">
                  <span className="text-sm text-gray-500">Preview:</span>
                  <span 
                    className="px-4 py-1 rounded text-sm font-bold shadow-sm"
                    style={{ backgroundColor: formData.color, color: formData.textColor }}
                  >
                    {formData.name || 'Nome da Marca'}
                  </span>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={e => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="activeCheck" className="text-sm font-medium text-gray-700">Marca Ativa</label>
              </div>

              <div className="pt-4 flex gap-3">
                 <Button type="button" variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                 <Button type="submit" fullWidth>Salvar Marca</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};