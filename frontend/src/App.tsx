import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Layouts & Contexts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { CartProvider } from './features/cart/context/CartContext';
import { CartSidebar } from './features/cart/components/CartSidebar';

import { Spinner } from './components/ui/Spinner';

// Lazy Loaded Pages
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const AdminLoginPage = lazy(() => import('./features/auth/pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const MenuBrowser = lazy(() => import('./features/menu/pages/MenuBrowser').then(m => ({ default: m.MenuBrowser })));
const CheckoutPage = lazy(() => import('./features/orders/pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderHistory = lazy(() => import('./features/orders/pages/OrderHistory').then(m => ({ default: m.OrderHistory })));
const AdminDashboard = lazy(() => import('./features/admin/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const OrderManagement = lazy(() => import('./features/admin/pages/OrderManagement').then(m => ({ default: m.OrderManagement })));
const AllOrdersPage = lazy(() => import('./features/admin/pages/AllOrdersPage').then(m => ({ default: m.AllOrdersPage })));
const MealManagement = lazy(() => import('./features/admin/pages/MealManagement').then(m => ({ default: m.MealManagement })));
const SystemSettingsPage = lazy(() => import('./features/admin/pages/SystemSettingsPage').then(m => ({ default: m.SystemSettingsPage })));
const CategoryManagement = lazy(() => import('./features/admin/pages/CategoryManagement').then(m => ({ default: m.CategoryManagement })));
const QRScannerPage = lazy(() => import('./features/admin/pages/QRScannerPage').then(m => ({ default: m.QRScannerPage })));
const AdminManagement = lazy(() => import('./features/admin/pages/AdminManagement').then(m => ({ default: m.AdminManagement })));
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Loading Fallback UI
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <Spinner size="xl" />
    <p className="text-gray-500 font-medium animate-pulse">Loading experience...</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <CartSidebar />
            <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-secure-login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Main Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Common Routes */}
              <Route path="/" element={<Navigate to="/menu" replace />} />
              <Route path="/menu" element={<MenuBrowser />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/history" element={<OrderHistory />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Admin & Staff Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<OrderManagement />} />
                <Route path="/admin/orders/all" element={<AllOrdersPage />} />
                <Route path="/admin/meals" element={<MealManagement />} />
                <Route path="/admin/categories" element={<CategoryManagement />} />
                <Route path="/admin/settings" element={<SystemSettingsPage />} />
                <Route path="/admin/users" element={<AdminManagement />} />
                <Route path="/admin/scan-qr" element={<QRScannerPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
            </Suspense>
          </BrowserRouter>
          <ToastProvider />
        </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
