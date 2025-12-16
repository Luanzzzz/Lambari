
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Check, X, FileSpreadsheet, Power } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ImportModal } from '../../components/ImportModal';
import { ProductForm } from './ProductForm';
import toast from 'react-hot-toast';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | undefined>(undefined);

  // States for Inline Edit
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.deleteProduct(id);
        toast.success('Produto excluído');
        loadProducts();
      } catch (e) {
        toast.error('Erro ao excluir');
      }
    }
  };

  const openNewProduct = () => {
      setEditingProduct(undefined);
      setIsModalOpen(true);
  };

  const openEditProduct = (p: Product) => {
      setEditingProduct(p);
      setIsModalOpen(true);
  };

  const handlePriceClick = (product: Product) => {
    setEditingPriceId(product.id);
    setTempPrice(product.price.toString());
  };

  const savePrice = async (id: string) => {
    const val = parseFloat(tempPrice);
    if (isNaN(val) || val <= 0) {
      toast.error("Preço inválido");
      return;
    }
    try {
      await api.patchProduct(id, 'price', val);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, price: val } : p));
      setEditingPriceId(null);
      toast.success("Preço atualizado");
    } catch (e) {
      toast.error("Erro ao salvar preço");
    }
  };

  const toggleActive = async (product: Product) => {
     try {
       const newState = !product.active;
       setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: newState } : p));
       await api.patchProduct(product.id, 'active', newState);
       toast.success(newState ? "Produto ativado" : "Produto desativado");
     } catch (e) {
       toast.error("Erro ao alterar status");
       loadProducts();
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Gerenciar Produtos</h2>
        <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
                <FileSpreadsheet size={20} className="mr-2" /> Importar CSV
            </Button>
            <Button onClick={openNewProduct}>
                <Plus size={20} className="mr-2" /> Novo Produto
            </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-4 font-medium w-10"></th>
              <th className="p-4 font-medium">Produto</th>
              <th className="p-4 font-medium">Preço (R$)</th>
              <th className="p-4 font-medium text-center">Status</th>
              <th className="p-4 font-medium">Estoque Total</th>
              <th className="p-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => {
                const totalStock = Object.values(p.stock).reduce<number>((a, b) => a + (b as number), 0);
                const isExpanded = expandedRow === p.id;
                
                return (
              <React.Fragment key={p.id}>
                <tr className={`hover:bg-gray-50 transition-colors ${!p.active ? 'opacity-60 bg-gray-50' : ''}`}>
                  <td className="p-4 text-center">
                      <button 
                        onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                        className="text-gray-400 hover:text-primary transition-colors"
                      >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                  </td>
                  <td className="p-4">
                      <div className="font-medium text-text-primary">{p.name}</div>
                      <div className="text-xs text-gray-400">Ref: {p.sku || p.id}</div>
                  </td>
                  
                  <td className="p-4 w-40" onDoubleClick={() => handlePriceClick(p)}>
                      {editingPriceId === p.id ? (
                          <div className="flex items-center gap-1">
                              <input 
                                autoFocus
                                type="number" 
                                className="w-20 p-1 border border-primary rounded text-sm"
                                value={tempPrice}
                                onChange={e => setTempPrice(e.target.value)}
                                onKeyDown={e => {
                                    if(e.key === 'Enter') savePrice(p.id);
                                    if(e.key === 'Escape') setEditingPriceId(null);
                                }}
                              />
                              <button onClick={() => savePrice(p.id)} className="text-green-600"><Check size={16} /></button>
                          </div>
                      ) : (
                          <div className="group flex items-center gap-2 cursor-pointer" title="Clique duplo para editar">
                             <span className="text-text-secondary">R$ {p.price.toFixed(2)}</span>
                             {p.isPromo && <span className="text-xs text-red-500 font-bold bg-red-50 px-1 rounded">PROMO</span>}
                             <Edit2 size={12} className="opacity-0 group-hover:opacity-50 text-gray-400" />
                          </div>
                      )}
                  </td>

                  <td className="p-4 text-center">
                     <button 
                        onClick={() => toggleActive(p)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            p.active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        }`}
                     >
                        {p.active ? 'ATIVO' : 'INATIVO'}
                     </button>
                  </td>

                  <td className="p-4">
                      <div className={`flex items-center gap-2 font-bold ${
                          totalStock === 0 ? 'text-red-500' : totalStock < 10 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                          {totalStock} un
                      </div>
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditProduct(p)} className="text-blue-600 hover:text-blue-800 p-1">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {isExpanded && (
                    <tr className="bg-blue-50/50">
                        <td colSpan={6} className="p-4 pl-14">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Detalhes de Estoque</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(p.stock).map(([size, qty]) => (
                                            <span key={size} className="bg-white border px-2 py-1 rounded text-sm">
                                                <b>{size}:</b> {qty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end items-center">
                                     <Button size="sm" onClick={() => openEditProduct(p)}>
                                        Gerenciar Grade Completa
                                     </Button>
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
              </React.Fragment>
            )})}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">Nenhum produto cadastrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductForm 
            initialData={editingProduct} 
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => { setIsModalOpen(false); loadProducts(); }}
        />
      )}

      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onSuccess={() => { setIsImportOpen(false); loadProducts(); }}
      />
    </div>
  );
};
