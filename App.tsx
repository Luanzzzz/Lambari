
import React, { useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ==========================================
// EAGER LOAD - Customer pages (instant load)
// ==========================================
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

// ==========================================
// LAZY LOAD - Admin pages (load on demand)
// Reduces initial bundle by ~300KB
// ==========================================
import { AdminLayout } from './layouts/AdminLayout';
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const StockDashboard = lazy(() => import('./pages/admin/StockDashboard').then(m => ({ default: m.StockDashboard })));
const ProductList = lazy(() => import('./pages/admin/ProductList').then(m => ({ default: m.ProductList })));
const OrderList = lazy(() => import('./pages/admin/OrderList').then(m => ({ default: m.OrderList })));
const KitManager = lazy(() => import('./pages/admin/KitManager').then(m => ({ default: m.KitManager })));
const BulkImport = lazy(() => import('./pages/admin/BulkImport').then(m => ({ default: m.BulkImport })));
const BrandManager = lazy(() => import('./pages/admin/BrandManager').then(m => ({ default: m.BrandManager })));
const BannerManager = lazy(() => import('./pages/admin/BannerManager').then(m => ({ default: m.BannerManager })));
const CategoryManager = lazy(() => import('./pages/admin/CategoryManager').then(m => ({ default: m.CategoryManager })));

import { ShopProvider } from './context/ShopContext';
import { CartSidebar } from './components/CartSidebar';
import { ChatWidget } from './components/ChatWidget';

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600 font-medium">Carregando...</p>
    </div>
  </div>
);

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

          {/* Protected Admin Routes - Lazy loaded */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute isAuthenticated={isAdminAuthenticated}>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="banners" element={<Suspense fallback={<PageLoader />}><BannerManager /></Suspense>} />
            <Route path="pedidos" element={<Suspense fallback={<PageLoader />}><OrderList /></Suspense>} />
            <Route path="stock" element={<Suspense fallback={<PageLoader />}><StockDashboard /></Suspense>} />
            <Route path="kits" element={<Suspense fallback={<PageLoader />}><KitManager /></Suspense>} />
            <Route path="products" element={<Suspense fallback={<PageLoader />}><ProductList /></Suspense>} />
            <Route path="brands" element={<Suspense fallback={<PageLoader />}><BrandManager /></Suspense>} />
            <Route path="import" element={<Suspense fallback={<PageLoader />}><BulkImport /></Suspense>} />
            <Route path="categories" element={<Suspense fallback={<PageLoader />}><CategoryManager /></Suspense>} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </HashRouter>
    </ShopProvider>
  );
};

export default App;
