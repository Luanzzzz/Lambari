
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, LogOut, ShoppingCart, Layers, BarChart2, FileSpreadsheet, Hexagon, Image } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, clear auth tokens here
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-accent text-primary font-medium' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight">Lambari Admin</h1>
          <span className="text-xs text-blue-200">Painel Atacadista</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/admin" end className={navLinkClass}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink to="/admin/banners" className={navLinkClass}>
            <Image size={20} />
            Banners
          </NavLink>

          <NavLink to="/admin/pedidos" className={navLinkClass}>
             <ShoppingCart size={20} />
             Pedidos
          </NavLink>

          <NavLink to="/admin/stock" className={navLinkClass}>
             <BarChart2 size={20} />
             Estoque
          </NavLink>
          
          <NavLink to="/admin/products" className={navLinkClass}>
            <Package size={20} />
            Produtos
          </NavLink>

          <NavLink to="/admin/kits" className={navLinkClass}>
            <Layers size={20} />
            Montar Kits
          </NavLink>
          
          <NavLink to="/admin/brands" className={navLinkClass}>
            <Hexagon size={20} />
            Gerenciar Marcas
          </NavLink>
          
          <NavLink to="/admin/import" className={navLinkClass}>
            <FileSpreadsheet size={20} />
            Importar Kits
          </NavLink>

          <NavLink to="/admin/categories" className={navLinkClass}>
            <Tag size={20} />
            Categorias
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-300 hover:text-red-100 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
