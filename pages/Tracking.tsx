
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MOCK_ORDERS } from '../services/mockData';
import { Order } from '../types';
import { Search, CheckCircle, Clock, Truck, Package, Calendar, ArrowLeft } from 'lucide-react';

export const Tracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingCode, setTrackingCode] = useState('');
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('codigo');
    if (code) {
      setTrackingCode(code);
      handleSearch(code);
    }
  }, [searchParams]);

  const handleSearch = (code = trackingCode) => {
    setError('');
    
    // Simulate API search
    const order = MOCK_ORDERS.find(o => o.id === code);
    
    if (order) {
      setOrderData(order);
    } else {
      setError('Código de rastreio não encontrado. Verifique se digitou corretamente.');
      setOrderData(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      <Header categories={[]} onSearch={() => {}} onLoginSuccess={() => {}} />

      <div className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-3">
            <Package size={32} /> RASTREAMENTO
          </h1>
          <p className="text-gray-500">Acompanhe a entrega do seu pedido em tempo real</p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-3">Digite o código do pedido:</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Ex: LK-2025-00123"
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all uppercase"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button 
              onClick={() => handleSearch()}
              className="bg-primary hover:bg-primary-light text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
              BUSCAR
            </button>
          </div>
          {error && (
            <div className="mt-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <span className="font-bold">⚠️</span> {error}
            </div>
          )}
        </div>

        {/* Results */}
        {orderData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.5s_ease-out]">
            {/* Order Summary */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Pedido</span>
                <span className="text-lg font-bold text-primary">#{orderData.id}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Data</span>
                <span className="text-gray-800">{new Date(orderData.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Total</span>
                <span className="text-gray-800 font-medium">R$ {orderData.total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Envio</span>
                <span className="text-gray-800">{orderData.tracking.carrier}</span>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-lg font-bold text-primary mb-8 flex items-center gap-2">
                📍 STATUS DA ENTREGA
              </h2>

              <div className="relative pl-10 border-l-2 border-gray-100 space-y-10">
                {orderData.tracking.timeline.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Status Dot */}
                    <div 
                      className={`absolute -left-[49px] w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm
                        ${step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
                        ${step.status === 'Em Trânsito' && step.completed ? 'bg-blue-100 text-blue-600' : ''}
                      `}
                    >
                      {step.completed ? (
                         <CheckCircle size={20} /> 
                      ) : step.status === 'Em Trânsito' ? (
                         <Truck size={20} />
                      ) : (
                         <Clock size={20} />
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.status}
                      </h3>
                      
                      {step.date ? (
                        <p className="text-sm text-gray-500">
                          {new Date(step.date).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(step.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      ) : step.status !== 'Entregue' ? (
                        <p className="text-sm text-orange-500 font-medium bg-orange-50 inline-block px-2 py-1 rounded mt-1">
                          Previsão: {orderData.tracking.estimatedDelivery ? 
                            new Date(orderData.tracking.estimatedDelivery).toLocaleDateString('pt-BR') : 'Em breve'}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Aguardando atualização...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Estimation Box */}
              {orderData.status !== 'delivered' && (
                <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-blue-800 uppercase">Previsão de Entrega</span>
                    <span className="text-xl font-bold text-primary">
                      {orderData.tracking.estimatedDelivery ? 
                        new Date(orderData.tracking.estimatedDelivery).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'Calculando...'}
                    </span>
                  </div>
                </div>
              )}

              {/* Delivered Box */}
              {orderData.status === 'delivered' && (
                <div className="mt-10 bg-green-50 border border-green-100 rounded-xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-green-800 uppercase">Pedido Entregue!</span>
                    <span className="text-xl font-bold text-green-700">
                      {orderData.tracking.deliveredDate && new Date(orderData.tracking.deliveredDate).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      }
                    </span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => navigate('/minha-conta')}
                className="mt-8 text-gray-500 hover:text-primary font-medium flex items-center gap-2 transition-colors"
              >
                <ArrowLeft size={20} /> Voltar aos Meus Pedidos
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
