
import React, { useState, useEffect } from 'react';
import { Category, CategoryType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit2, Trash2, Search, Filter, List, FolderTree, ChevronDown, ChevronUp, FileSpreadsheet, X, Check } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

// Helper for labels
const getCategoryTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    season: 'Estação',
    brand: 'Marca',
    gender: 'Gênero',
    product: 'Produto',
    product_sub: 'Subcategoria'
  };
  return labels[type] || type;
};

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (e) {
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await api.deleteCategory(categoryId);
        // Optimistic UI: update local state immediately
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        toast.success('Categoria excluída');
      } catch (e) {
        toast.error('Erro ao excluir categoria');
        // On error, re-fetch to restore correct state
        loadCategories();
      }
    }
  };

  const handleToggleActive = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      try {
        await api.updateCategory(categoryId, { active: !category.active });
        loadCategories();
      } catch (e) {
        toast.error('Erro ao atualizar categoria');
      }
    }
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryData);
        toast.success('Categoria atualizada!');
      } else {
        await api.createCategory({
          name: categoryData.name || '',
          slug: categoryData.slug || '',
          type: categoryData.type || 'product',
          active: categoryData.active !== false,
          order: categories.length + 1,
          productCount: 0,
          ...categoryData
        } as Omit<Category, 'id'>);
        toast.success('Categoria criada!');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (e) {
      toast.error('Erro ao salvar categoria');
    }
  };

  const filteredCategories = categories.filter(cat => {
    const matchSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || cat.type === filterType;
    return matchSearch && matchType;
  });

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.active).length,
    inactive: categories.filter(c => !c.active).length,
    withProducts: categories.filter(c => (c.productCount || 0) > 0).length
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-primary">Gerenciar Categorias</h2>
          <p className="text-gray-500">Organize e personalize a estrutura do seu catálogo.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => toast('Funcionalidade de importação em breve')}>
            <FileSpreadsheet className="mr-2" size={20} /> Importar CSV
          </Button>
          <Button onClick={handleCreateCategory}>
            <Plus className="mr-2" size={20} /> Nova Categoria
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl">📊</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Total</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-xl">✅</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Ativas</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-xl">⏸️</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.inactive}</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Inativas</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xl">📦</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.withProducts}</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Com Produtos</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1 w-full flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar categorias..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="h-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white appearance-none cursor-pointer min-w-[180px]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os Tipos</option>
              <option value="season">Estação</option>
              <option value="brand">Marca</option>
              <option value="gender">Gênero</option>
              <option value="product">Produto</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            title="Lista"
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`p-2 rounded-md transition-all ${viewMode === 'tree' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            title="Árvore"
          >
            <FolderTree size={20} />
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="p-4">Categoria</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Produtos</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Ordem</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map(cat => (
                <React.Fragment key={cat.id}>
                  <tr className={`hover:bg-gray-50 transition-colors ${!cat.active ? 'opacity-60 bg-gray-50' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gray-50"
                          style={{ color: cat.color }}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{cat.name}</div>
                          <div className="text-xs text-gray-500 max-w-[200px] truncate">{cat.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${cat.type === 'season' ? 'bg-yellow-100 text-yellow-800' :
                          cat.type === 'brand' ? 'bg-blue-100 text-blue-800' :
                            cat.type === 'gender' ? 'bg-pink-100 text-pink-800' :
                              'bg-green-100 text-green-800'}
                      `}>
                        {getCategoryTypeLabel(cat.type || '')}
                      </span>
                    </td>
                    <td className="p-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-mono">{cat.slug}</code>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {cat.productCount} item(s)
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(cat.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cat.active ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cat.active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-primary"><ChevronUp size={14} /></button>
                        <span className="font-mono font-bold text-gray-700 w-6 text-center">{cat.order}</span>
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-primary"><ChevronDown size={14} /></button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditCategory(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Children Render */}
                  {cat.children && cat.children.map(sub => (
                    <tr key={sub.id} className="bg-gray-50/50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 pl-12 relative">
                        <div className="absolute left-8 top-1/2 w-3 h-px bg-gray-300"></div>
                        <div className="absolute left-8 top-0 bottom-1/2 w-px bg-gray-300"></div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-700 text-sm">{sub.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-bold uppercase">Subcategoria</span>
                      </td>
                      <td className="p-4">
                        <code className="bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-500 font-mono">{sub.slug}</code>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{sub.productCount} item(s)</td>
                      <td className="p-4 text-center">
                        <div className={`w-2 h-2 rounded-full mx-auto ${sub.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </td>
                      <td className="p-4 text-center text-xs text-gray-400">-</td>
                      <td className="p-4 text-right">
                        <button className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <Search size={48} className="opacity-20" />
                      <p>Nenhuma categoria encontrada.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Tree View
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {['season', 'brand', 'gender', 'product'].map(type => {
            const typeCats = filteredCategories.filter(c => c.type === type);
            if (typeCats.length === 0) return null;

            return (
              <div key={type} className="mb-8 last:mb-0">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 uppercase tracking-wider flex items-center gap-2">
                  {type === 'season' && '🌤️'}
                  {type === 'brand' && '⭐'}
                  {type === 'gender' && '👶'}
                  {type === 'product' && '📦'}
                  {getCategoryTypeLabel(type)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeCats.map(cat => (
                    <div key={cat.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl" style={{ color: cat.color }}>{cat.icon}</span>
                        <span className="font-bold text-gray-800">{cat.name}</span>
                        <span className="ml-auto text-xs bg-white px-2 py-1 rounded border border-gray-200 font-mono">
                          {cat.productCount}
                        </span>
                      </div>
                      {cat.children && cat.children.length > 0 && (
                        <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-3 space-y-2">
                          {cat.children.map(sub => (
                            <div key={sub.id} className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="w-2 h-px bg-gray-300"></span>
                              {sub.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENT: CATEGORY MODAL ---

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    type: 'product',
    icon: '📦',
    color: '#1E40AF',
    description: '',
    active: true,
    order: 1,
    ...category
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleChange = (field: keyof Category, value: any) => {
    setFormData(prev => {
      const updates = { [field]: value };
      if (field === 'name' && !category) {
        // Auto-generate slug only for new categories
        updates.slug = generateSlug(value);
      }
      return { ...prev, ...updates };
    });
  };

  const ICONS = ['📦', '👕', '👔', '👖', '👗', '🩳', '👠', '👟', '🧥', '🧦', '👙', '🎀', '🌙', '⭐', '👑', '✨', '☀️', '❄️', '🌸', '🍂', '👦', '👧', '👶', '🍼'];
  const COLORS = ['#1E40AF', '#3B82F6', '#EC4899', '#F59E0B', '#F97316', '#10B981', '#8B5CF6', '#EF4444', '#6B7280'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-[fadeIn_0.2s_ease-out]">

        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="font-bold text-xl text-primary">{category ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <Input
                label="Nome da Categoria *"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Ex: Camisetas"
                autoFocus
                required
              />
            </div>

            <div className="col-span-2">
              <Input
                label="Slug (URL Amigável) *"
                value={formData.slug}
                onChange={e => handleChange('slug', e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Identificador único usado na URL.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary bg-white"
                value={formData.type}
                onChange={e => handleChange('type', e.target.value as CategoryType)}
              >
                <option value="product">Categoria de Produto</option>
                <option value="product_sub">Subcategoria</option>
                <option value="season">Estação / Coleção</option>
                <option value="brand">Marca / Linha</option>
                <option value="gender">Gênero</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary"
                value={formData.order}
                onChange={e => handleChange('order', parseInt(e.target.value))}
                min="1"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
              <div className="grid grid-cols-8 gap-2">
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => handleChange('icon', ic)}
                    className={`h-10 rounded border text-xl flex items-center justify-center hover:bg-gray-50 transition-all ${formData.icon === ic ? 'border-primary bg-blue-50 ring-2 ring-primary/20' : 'border-gray-200'}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Destaque</label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleChange('color', c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === c ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary h-24 resize-none"
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Breve descrição da categoria..."
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-4 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={e => handleChange('active', e.target.checked)}
                  className="w-5 h-5 accent-primary"
                />
                <span className="font-medium text-gray-700">Categoria Ativa (Visível na loja)</span>
              </label>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(formData)}>
            {category ? 'Salvar Alterações' : 'Criar Categoria'}
          </Button>
        </div>
      </div>
    </div>
  );
};
