
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DashboardStats, Product, StockMovement } from '../../types';
import { AlertTriangle, CheckCircle, Package, ArrowDown, ArrowUp, Clock } from 'lucide-react';

export const StockDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [statsData, productsData, historyData] = await Promise.all([
        api.getDashboardStats(),
        api.getProducts(),
        api.getStockHistory()
      ]);
      setStats(statsData);
      setProducts(productsData);
      setHistory(historyData);
      setLoading(false);
    };
    loadData();
  }, []);

  const lowStockProducts = products
    .filter(p => {
        const total = Object.values(p.stock).reduce<number>((a, b) => a + (b as number), 0);
        return total > 0 && total <= 10;
    })
    .sort((a, b) => {
        const stockA = Object.values(a.stock).reduce<number>((x, y) => x + (y as number), 0);
        const stockB = Object.values(b.stock).reduce<number>((x, y) => x + (y as number), 0);
        return stockA - stockB;
    });

  const criticalStockProducts = products.filter(p => !p.inStock);

  if (loading) return <div className="p-8">Carregando dados de estoque...</div>;

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <header>
        <h2 className="text-2xl font-bold text-primary">Gestão de Estoque Avançada</h2>
        <p className="text-gray-500">Monitore níveis, alertas e movimentações.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total em Peças</p>
            <h3 className="text-3xl font-bold text-primary">{stats?.totalStockCount}</h3>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-primary">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Estoque Saudável</p>
            <h3 className="text-3xl font-bold text-green-700">
               {products.length - (stats?.lowStockItems || 0) - (stats?.outOfStockItems || 0)}
            </h3>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-yellow-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Atenção (Baixo)</p>
            <h3 className="text-3xl font-bold text-yellow-700">{stats?.lowStockItems}</h3>
          </div>
          <div className="bg-yellow-50 p-3 rounded-full text-yellow-600">
            <AlertTriangle size={24} />
          </div>
          {/* Indicator bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400"></div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-red-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Crítico (Zerado)</p>
            <h3 className="text-3xl font-bold text-red-700">{stats?.outOfStockItems}</h3>
          </div>
          <div className="bg-red-50 p-3 rounded-full text-red-600">
            <AlertTriangle size={24} />
          </div>
           <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Alerts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-primary flex items-center gap-2">
                   <AlertTriangle size={18} className="text-yellow-500" />
                   Alertas de Reposição
                </h3>
                <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded font-medium">
                   {lowStockProducts.length + criticalStockProducts.length} itens
                </span>
             </div>
             <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {[...criticalStockProducts, ...lowStockProducts].map(p => {
                    const total = Object.values(p.stock).reduce<number>((a, b) => a + (b as number), 0);
                    const isCritical = total === 0;
                    return (
                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-10 rounded-full ${isCritical ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                                <div>
                                    <h4 className="font-medium text-primary text-sm">{p.name}</h4>
                                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                        <span>Ref: {p.id}</span>
                                        <span>•</span>
                                        <span className="uppercase">{p.brand}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-lg font-bold ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {total} un
                                </span>
                                <p className="text-xs text-gray-400">Total em estoque</p>
                            </div>
                        </div>
                    );
                })}
             </div>
          </div>
        </div>

        {/* Right Col: History */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
           <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-primary flex items-center gap-2">
                 <Clock size={18} />
                 Histórico Recente
              </h3>
           </div>
           <div className="divide-y divide-gray-100 overflow-y-auto flex-1 p-0">
              {history.map(h => (
                  <div key={h.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-gray-800 truncate w-3/4">{h.productName}</span>
                          <span className="text-xs text-gray-400">{new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                              <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Tam: {h.size}</span>
                              <span className="text-xs text-gray-500">{h.user}</span>
                          </div>
                          <div className={`flex items-center gap-1 font-bold text-sm ${h.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {h.quantity > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                              {Math.abs(h.quantity)}
                          </div>
                      </div>
                  </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
