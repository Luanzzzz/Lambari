
import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, ShoppingBag, Heart, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';
import { AuthModal } from './AuthModal';
import { useShop } from '../context/ShopContext';
import { Logo } from './Logo';

interface HeaderProps {
  categories: Category[];
  onSearch: (term: string) => void;
  onLoginSuccess: () => void;
}

export const Header: React.FC<HeaderProps> = ({ categories, onSearch, onLoginSuccess }) => {
  const { cartCount, wishlist, setIsCartOpen, auth, logout } = useShop();
  const [logoClicks, setLogoClicks] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Reset clicks after 2 seconds of inactivity
  useEffect(() => {
    if (logoClicks === 0) return;
    const timer = setTimeout(() => setLogoClicks(0), 1500);
    return () => clearTimeout(timer);
  }, [logoClicks]);

  useEffect(() => {
    if (logoClicks >= 3) {
      setIsAuthModalOpen(true);
      setLogoClicks(0);
    }
  }, [logoClicks]);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLogoClicks(prev => prev + 1);
    navigate('/');
  };

  const handleAdminLogin = () => {
    onLoginSuccess();
    navigate('/admin');
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-4 h-24 md:h-28 flex items-center justify-between gap-6">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>

          {/* Logo Section - Responsive */}
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center min-w-fit group"
          >
            {/* Mobile: Logo compacta */}
            <div className="block md:hidden">
              <Logo
                variant="full"
                size="md"
                className="transition-transform group-hover:scale-105"
              />
            </div>

            {/* Desktop: Logo completa e maior */}
            <div className="hidden md:block">
              <Logo
                variant="full"
                size="xl"
                className="transition-transform group-hover:scale-105"
              />
            </div>
          </a>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="O que você procura hoje?"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-full text-sm border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          
          {/* Icons Actions */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-fit">
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-50"
              onClick={() => setIsMenuOpen(true)}
            >
               <Search size={22} />
            </button>

            <button 
              onClick={() => navigate('/wishlist')}
              className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors relative group" 
              title="Meus Favoritos"
            >
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-blue-50 transition-colors relative group" 
              title="Minha Sacola"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                 <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                   {cartCount}
                 </span>
              )}
            </button>
            
            <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1"></div>
            
            {auth.isAuthenticated && auth.user ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-gray-50"
                >
                   <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                      {auth.user.name.charAt(0)}
                   </div>
                   <div className="text-left hidden lg:block">
                      <p className="text-xs text-gray-500">Olá,</p>
                      <p className="text-sm font-bold leading-none">{auth.user.name.split(' ')[0]}</p>
                   </div>
                   <ChevronDown size={16} className="text-gray-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-[fadeIn_0.1s_ease-out] overflow-hidden z-50">
                     <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs font-bold text-gray-500 uppercase">Minha Conta</p>
                     </div>
                     <button 
                        onClick={() => { navigate('/minha-conta'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary flex items-center gap-2"
                     >
                        <User size={16} /> Painel do Cliente
                     </button>
                     <button 
                        onClick={() => { navigate('/rastreio'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary flex items-center gap-2"
                     >
                        <Package size={16} /> Meus Pedidos
                     </button>
                     <div className="border-t border-gray-50 my-1"></div>
                     <button 
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                     >
                        <LogOut size={16} /> Sair
                     </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-primary transition-colors px-3 py-2 rounded-lg opacity-60 hover:opacity-100"
                title="Acesso opcional para clientes cadastrados"
              >
                 <User size={20} />
                 <span>Entrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white p-4 absolute w-full shadow-xl z-40 animate-[slideDown_0.2s_ease-out]">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Buscar..."
                  className="w-full p-3 pl-10 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary outline-none"
                  onChange={(e) => onSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                  className="text-left py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors font-medium"
                >
                  Catálogo
                </button>
                <button 
                  onClick={() => { navigate('/wishlist'); setIsMenuOpen(false); }}
                  className="text-left py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-red-500 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <Heart size={18} /> Favoritos
                </button>
                
                {auth.isAuthenticated ? (
                  <>
                    <button 
                      onClick={() => { navigate('/minha-conta'); setIsMenuOpen(false); }}
                      className="text-left py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      <User size={18} /> Minha Conta
                    </button>
                    <button 
                      onClick={() => { navigate('/rastreio'); setIsMenuOpen(false); }}
                      className="text-left py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      <Package size={18} /> Rastreio
                    </button>
                    <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="text-left py-3 px-4 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      <LogOut size={18} /> Sair
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                    className="text-left py-3 px-4 text-gray-500 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <User size={18} /> Entrar (Opcional)
                  </button>
                )}
                
                <div className="border-t border-gray-100 my-2"></div>
                
                <button 
                  onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                  className="text-left py-3 px-4 text-gray-400 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors text-xs flex items-center gap-2"
                >
                  Area Administrativa
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleAdminLogin}
      />
    </>
  );
};
