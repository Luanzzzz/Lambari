
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { Catalog } from './pages/Catalog';
import { Wishlist } from './pages/Wishlist';
import { Login } from './pages/Login';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { Tracking } from './pages/Tracking';
// Institutional Pages
import { About } from './pages/About';
import { Shipping } from './pages/Shipping';
import { ReturnPolicy } from './pages/ReturnPolicy';
import { Contact } from './pages/Contact';

import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { StockDashboard } from './pages/admin/StockDashboard';
import { ProductList } from './pages/admin/ProductList';
import { OrderList } from './pages/admin/OrderList';
import { KitManager } from './pages/admin/KitManager';
import { BulkImport } from './pages/admin/BulkImport';
import { BrandManager } from './pages/admin/BrandManager';
import { CategoryManager } from './pages/admin/CategoryManager'; // New Import
import { ShopProvider } from './context/ShopContext';
import { CartSidebar } from './components/CartSidebar';
import { ChatWidget } from './components/ChatWidget';

// Placeholder components for routes not fully implemented in this demo
const History = () => <div className="p-4">Histórico do Bot (Em breve)</div>;

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  // Simple Admin Auth State for Demo
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  return (
    <ShopProvider>
      <HashRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              style: { background: '#003366' },
              iconTheme: { primary: '#FFD700', secondary: '#003366' }
            }
          }}
        />

        <CartSidebar />
        <ChatWidget />

        <Routes>
          {/* Public Routes - Catalog is now Home */}
          <Route path="/" element={<Catalog onLoginSuccess={() => setIsAdminAuthenticated(true)} />} />
          <Route path="/produtos" element={<Navigate to="/" replace />} />

          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/rastreio" element={<Tracking />} />
          <Route path="/minha-conta" element={<CustomerDashboard />} />

          {/* Institutional Routes */}
          <Route path="/sobre" element={<About />} />
          <Route path="/envios" element={<Shipping />} />
          <Route path="/politica-troca" element={<ReturnPolicy />} />
          <Route path="/contato" element={<Contact />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute isAuthenticated={isAdminAuthenticated}>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pedidos" element={<OrderList />} />
            <Route path="stock" element={<StockDashboard />} />
            <Route path="kits" element={<KitManager />} />
            <Route path="products" element={<ProductList />} />
            <Route path="brands" element={<BrandManager />} />
            <Route path="import" element={<BulkImport />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </HashRouter>
    </ShopProvider>
  );
};

export default App;
