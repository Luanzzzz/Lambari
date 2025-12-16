
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Kit, UserProfile, AuthState } from '../types';
import toast from 'react-hot-toast';
import { MOCK_USER_PROFILE } from '../services/mockData';
import { WHATSAPP_CONFIG } from '../utils/formatters';

export interface CartItem extends Kit {
  quantity: number;
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: Kit[];
  isCartOpen: boolean;
  addToCart: (kit: Kit) => void;
  removeFromCart: (kitId: string) => void;
  updateQuantity: (kitId: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (kit: Kit) => void;
  isInWishlist: (kitId: string) => boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  cartCount: number;
  checkoutWhatsApp: () => void;
  // Auth
  auth: AuthState;
  login: (rememberMe: boolean) => void;
  logout: () => void;
  checkAuth: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Kit[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isAdmin: false
  });

  // Load from Storage on Mount
  useEffect(() => {
    const savedCart = localStorage.getItem('lambari_cart');
    const savedWishlist = localStorage.getItem('lambari_wishlist');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    checkAuth();
  }, []);

  // Save to LocalStorage on Change
  useEffect(() => {
    localStorage.setItem('lambari_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('lambari_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // --- AUTH ACTIONS ---

  const checkAuth = () => {
    // Check Local Storage (Remember Me)
    const localSession = localStorage.getItem('lambari_session');
    if (localSession) {
      setAuth(JSON.parse(localSession));
      return;
    }

    // Check Session Storage (Current Tab)
    const sessionSession = sessionStorage.getItem('lambari_session');
    if (sessionSession) {
      setAuth(JSON.parse(sessionSession));
      return;
    }
  };

  const login = (rememberMe: boolean) => {
    const sessionData: AuthState = {
      isAuthenticated: true,
      user: MOCK_USER_PROFILE,
      isAdmin: false
    };

    setAuth(sessionData);

    if (rememberMe) {
      localStorage.setItem('lambari_session', JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem('lambari_session', JSON.stringify(sessionData));
    }
    toast.success(`Bem-vindo, ${MOCK_USER_PROFILE.name.split(' ')[0]}!`);
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, user: null, isAdmin: false });
    localStorage.removeItem('lambari_session');
    sessionStorage.removeItem('lambari_session');
    toast('Você saiu da conta', { icon: '👋' });
  };

  // --- CART ACTIONS ---

  const addToCart = (kit: Kit) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === kit.id);
      if (existing) {
        toast.success(`Mais uma unidade de "${kit.name}" adicionada!`);
        return prev.map(item =>
          item.id === kit.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`"${kit.name}" adicionado ao carrinho!`);
      // Open cart automatically on first add or just badge update? Let's just toast.
      return [...prev, { ...kit, quantity: 1 }];
    });
  };

  const removeFromCart = (kitId: string) => {
    setCart(prev => prev.filter(item => item.id !== kitId));
    toast.error('Item removido do carrinho.');
  };

  const updateQuantity = (kitId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === kitId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item; // Don't remove, just stop at 1
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Carrinho limpo.');
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const checkoutWhatsApp = () => {
    if (cart.length === 0) {
      toast.error('Seu carrinho está vazio!');
      return;
    }

    const phone = WHATSAPP_CONFIG.PHONE;
    let message = `Olá! Gostaria de fazer um pedido no Atacado Lambari Kids:\n\n`;

    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      message += `📦 *${item.quantity}x ${item.name}* (Ref: ${item.id})\n`;
      message += `   Preço Un: R$ ${item.price.toFixed(2)} | Sub: R$ ${subtotal.toFixed(2)}\n\n`;
    });

    message += `💰 *TOTAL DO PEDIDO: R$ ${cartTotal.toFixed(2)}*\n\n`;
    message += `Aguardo confirmação de disponibilidade e dados para pagamento.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // --- WISHLIST ACTIONS ---

  const toggleWishlist = (kit: Kit) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === kit.id);
      if (exists) {
        toast('Removido dos favoritos', { icon: '💔' });
        return prev.filter(item => item.id !== kit.id);
      }
      toast('Adicionado aos favoritos', { icon: '💖' });
      return [...prev, kit];
    });
  };

  const isInWishlist = (kitId: string) => {
    return wishlist.some(item => item.id === kitId);
  };

  return (
    <ShopContext.Provider value={{
      cart,
      wishlist,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      setIsCartOpen,
      cartTotal,
      cartCount,
      checkoutWhatsApp,
      auth,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
