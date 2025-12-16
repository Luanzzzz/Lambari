
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { Package, Tag, AlertTriangle, Eye, DollarSign, TrendingUp, ShoppingBag, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';

// Moved MetricCard outside to prevent re-creation on every render
const MetricCard = ({ title, value, subValue, icon: Icon, colorClass, growth }: any) => (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
           <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
        </div>
        {growth !== undefined && (
            <div className={`flex items-center text-sm font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {Math.abs(growth)}%
            </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
    </div>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats);
  }, []);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary">Dashboard Gerencial</h2>
            <p className="text-gray-500">Visão geral financeira e operacional.</p>
          </div>
      </header>

      {!stats ? (
        <div className="p-12 text-center text-gray-500">Carregando métricas...</div>
      ) : (
        <>
          {/* Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
                title="Vendas Totais" 
                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalSales)} 
                icon={DollarSign} 
                colorClass="bg-green-500 text-green-500"
                growth={stats.salesGrowth}
            />
            <MetricCard 
                title="Lucro Total" 
                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalProfit)} 
                icon={TrendingUp} 
                colorClass="bg-blue-500 text-blue-500"
                growth={stats.profitGrowth}
            />
            <MetricCard 
                title="Margem Média" 
                value={`${stats.averageMargin}%`} 
                icon={BarChart3} 
                colorClass="bg-purple-500 text-purple-500"
                growth={stats.marginGrowth}
            />
            <MetricCard 
                title="Pedidos (Mês)" 
                value={stats.ordersCount} 
                icon={ShoppingBag} 
                colorClass="bg-orange-500 text-orange-500"
                growth={stats.ordersGrowth}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-primary mb-6">Vendas dos Últimos 30 Dias</h3>
                <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.salesHistory}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#003366" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} minTickGap={30} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip 
                        cursor={{stroke: '#ccc', strokeDasharray: '5 5'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        formatter={(val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}
                    />
                    <Area type="monotone" dataKey="value" stroke="#003366" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
            </div>

            {/* Operational Metrics & Top Products */}
            <div className="space-y-6">
                {/* Mini Operational Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Produtos</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Estoque Baixo</p>
                        <p className="text-2xl font-bold text-red-500">{stats.lowStock}</p>
                    </div>
                </div>

                {/* Top Products List */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm h-full flex flex-col">
                    <h3 className="font-bold text-lg text-primary mb-4">Produtos Mais Vendidos</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {stats.topProducts.map((prod, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{prod.name}</p>
                                        <p className="text-xs text-gray-400">{prod.sales} vendas</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.revenue)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
