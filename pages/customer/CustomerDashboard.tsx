import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Package, User, BarChart, ExternalLink, RefreshCw } from 'lucide-react';
import { MOCK_ORDERS } from '../../services/mockData';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  in_transit: 'Em Trânsito',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
};

export const CustomerDashboard: React.FC = () => {
  const { auth, logout } = useShop();
  const navigate = useNavigate();
  const user = auth.user;

  // Protect route
  if (!auth.isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      <Header 
        categories={[]} 
        onSearch={() => {}} 
        onLoginSuccess={() => {}} 
      />

      <div className="container mx-auto px-4 py-8 flex-1">
        
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-primary mb-2">Bem-vindo, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500">Cliente desde {new Date(user.memberSince).toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-default">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">PEDIDOS</div>
            <div className="text-3xl font-bold text-primary mb-1">{MOCK_ORDERS.length}</div>
            <div className="text-sm text-gray-400">Total de pedidos</div>
          </div>

          <div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => navigate('/rastreio')}
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📦</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">RASTREIO</div>
            <div className="text-xl font-bold text-primary mb-1 flex items-center gap-2">
              Rastrear <ExternalLink size={18} />
            </div>
            <div className="text-sm text-gray-400">Ver onde está seu pedido</div>
          </div>

          <div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">👤</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">PERFIL</div>
            <div className="text-xl font-bold text-primary mb-1 flex items-center gap-2">
              Meus Dados <ExternalLink size={18} />
            </div>
            <div className="text-sm text-gray-400">Editar endereço e contato</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-primary" /> MEUS PEDIDOS RECENTES
          </h2>

          <div className="space-y-4">
            {MOCK_ORDERS.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="text-lg font-bold text-gray-800">#{order.id}</div>
                    <div className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </div>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                        ${order.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}
                      `}
                    >
                      {order.status === 'in_transit' && '🚚 '}
                      {order.status === 'delivered' && '✅ '}
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </div>

                <div className="mb-6 text-gray-600">
                  <span className="font-medium">{order.items[0].name}</span>
                  {order.items.length > 1 && (
                    <span className="text-gray-400 text-sm"> + {order.items.length - 1} {order.items.length === 2 ? 'item' : 'itens'}</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors">
                    Ver Detalhes
                  </button>
                  {order.status === 'in_transit' ? (
                    <button 
                      onClick={() => navigate(`/rastreio?codigo=${order.id}`)}
                      className="flex-1 bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Rastrear Entrega
                    </button>
                  ) : (
                    <button className="flex-1 bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <RefreshCw size={18} /> Comprar Novamente
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full bg-white border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors mt-6">
            Ver Todos os Pedidos
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};