
import React, { useState } from 'react';
import { MOCK_ORDERS } from '../../services/mockData';
import { Order } from '../../types';
import { Eye, Search, Filter, Printer, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';

export const OrderList: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: Order['status']) => {
    const config = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      preparing: { label: 'Preparando', color: 'bg-purple-100 text-purple-800', icon: Package },
      in_transit: { label: 'Em Trânsito', color: 'bg-orange-100 text-orange-800', icon: Truck },
      delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    const C = config[status] || config.pending;
    const Icon = C.icon;

    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${C.color}`}>
        <Icon size={14} /> {C.label}
      </span>
    );
  };

  const filteredOrders = MOCK_ORDERS.filter(order => {
    if (filterStatus !== 'todos' && order.status !== filterStatus) return false;
    if (searchTerm && !order.id.toLowerCase().includes(searchTerm.toLowerCase()) && !order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Gestão de Pedidos</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Package size={24} /></div>
            <div>
               <p className="text-gray-500 text-xs font-bold uppercase">Total</p>
               <p className="text-2xl font-bold text-gray-800">{MOCK_ORDERS.length}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600"><Clock size={24} /></div>
            <div>
               <p className="text-gray-500 text-xs font-bold uppercase">Pendentes</p>
               <p className="text-2xl font-bold text-gray-800">{MOCK_ORDERS.filter(o => o.status === 'pending').length}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><Truck size={24} /></div>
            <div>
               <p className="text-gray-500 text-xs font-bold uppercase">Em Trânsito</p>
               <p className="text-2xl font-bold text-gray-800">{MOCK_ORDERS.filter(o => o.status === 'in_transit').length}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 border-l-4 border-l-green-500">
            <div className="p-3 bg-green-50 rounded-lg text-green-600"><CheckCircle size={24} /></div>
            <div>
               <p className="text-gray-500 text-xs font-bold uppercase">Faturamento</p>
               <p className="text-2xl font-bold text-green-700">R$ {MOCK_ORDERS.reduce((acc, o) => acc + o.total, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
         <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
               type="text" 
               placeholder="Buscar por ID ou Cliente..." 
               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select 
               className="py-2 px-4 border border-gray-300 rounded-lg focus:border-primary outline-none bg-white"
               value={filterStatus}
               onChange={e => setFilterStatus(e.target.value)}
            >
               <option value="todos">Todos os Status</option>
               <option value="pending">Pendente</option>
               <option value="in_transit">Em Trânsito</option>
               <option value="delivered">Entregue</option>
               <option value="cancelled">Cancelado</option>
            </select>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
               <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Pedido</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Data</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Cliente</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Itens</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Total</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                     <td className="p-4 font-mono font-medium text-primary">{order.id}</td>
                     <td className="p-4 text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString('pt-BR')}
                        <br />
                        <span className="text-xs text-gray-400">{new Date(order.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                     </td>
                     <td className="p-4">
                        <p className="text-sm font-bold text-gray-800">{order.customer.name}</p>
                        <p className="text-xs text-gray-500">{order.customer.company}</p>
                     </td>
                     <td className="p-4 text-sm text-gray-600">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                     </td>
                     <td className="p-4 font-bold text-primary">
                        R$ {order.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                     </td>
                     <td className="p-4">
                        {getStatusBadge(order.status)}
                     </td>
                     <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalhes">
                              <Eye size={18} />
                           </button>
                           <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Imprimir">
                              <Printer size={18} />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         
         {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-gray-400">
               <Package size={48} className="mx-auto mb-4 opacity-20" />
               <p>Nenhum pedido encontrado com os filtros atuais.</p>
            </div>
         )}
      </div>
    </div>
  );
};
