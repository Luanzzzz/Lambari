
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Kit } from '../../types';
import { Plus, Edit2, Trash2, Package, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { KitForm } from './KitForm';
import toast from 'react-hot-toast';

export const KitManager: React.FC = () => {
    const [kits, setKits] = useState<Kit[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingKit, setEditingKit] = useState<Kit | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    const loadKits = async () => {
        setLoading(true);
        try {
            const data = await api.getKits();
            setKits(data);
        } catch (error) {
            toast.error('Erro ao carregar kits');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadKits();
    }, []);

    const handleDelete = async (id: string) => {
        const kit = kits.find(k => k.id === id);
        const kitName = kit?.name || 'kit';

        console.log('🗑️ Tentando deletar kit:', { id, name: kitName });

        const confirmDelete = window.confirm(
            `Tem certeza que deseja excluir o kit "${kitName}"?\n\nEsta ação não pode ser desfeita.`
        );

        if (!confirmDelete) {
            console.log('❌ Usuário cancelou a exclusão');
            return;
        }

        console.log('✅ Usuário confirmou. Chamando API...');

        try {
            toast.loading('Excluindo kit...', { id: 'delete-kit' });

            await api.deleteKit(id);

            console.log('✅ API respondeu com sucesso');

            await loadKits();

            toast.success('Kit excluído com sucesso!', { id: 'delete-kit' });

            console.log('✅ Exclusão completa');
        } catch (error: any) {
            console.error('❌ ERRO AO DELETAR:', error);
            console.error('   Mensagem:', error.message);
            console.error('   Stack:', error.stack);

            toast.error(
                error.message || 'Erro ao excluir kit. Verifique o console.',
                { id: 'delete-kit' }
            );
        }
    };

    const startCreate = () => {
        setEditingKit(undefined);
        setView('form');
    };

    const startEdit = (kit: Kit) => {
        setEditingKit(kit);
        setView('form');
    };

    const handleFormClose = () => {
        setView('list');
        setEditingKit(undefined);
    };

    const handleFormSuccess = () => {
        setView('list');
        setEditingKit(undefined);
        loadKits();
    };

    const filteredKits = kits.filter(k =>
        k.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === 'form') {
        return (
            <KitForm
                initialData={editingKit}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
            />
        );
    }

    return (
        <div className="space-y-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Gerenciar Kits</h2>
                    <p className="text-gray-500">Crie e gerencie combos de produtos</p>
                </div>
                <Button onClick={startCreate}>
                    <Plus size={20} className="mr-2" /> Novo Kit
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary"
                        placeholder="Buscar kits..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-primary text-white sticky top-0 z-10">
                        <tr>
                            <th className="p-4 font-medium">Nome do Kit</th>
                            <th className="p-4 font-medium">Preço (R$)</th>
                            <th className="p-4 font-medium text-center">Itens</th>
                            <th className="p-4 font-medium text-center">Peças Total</th>
                            <th className="p-4 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-4"><div className="h-4 bg-gray-200 w-1/2 rounded"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 w-20 rounded"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 w-10 mx-auto rounded"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 w-10 mx-auto rounded"></div></td>
                                    <td className="p-4"><div className="h-8 bg-gray-200 w-16 ml-auto rounded"></div></td>
                                </tr>
                            ))
                        ) : filteredKits.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                                    <Package size={40} strokeWidth={1.5} />
                                    <span>Nenhum kit encontrado</span>
                                </td>
                            </tr>
                        ) : (
                            filteredKits.map(kit => (
                                <tr key={kit.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{kit.name}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-md">{kit.description}</div>
                                    </td>
                                    <td className="p-4 font-bold text-primary">R$ {kit.price.toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                            {kit.items.length} produtos
                                        </span>
                                    </td>
                                    <td className="p-4 text-center text-gray-600 font-medium">
                                        {kit.totalPieces} un
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => startEdit(kit)} className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(kit.id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
