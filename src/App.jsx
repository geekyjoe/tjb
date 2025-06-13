import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import Header from './components/Header';
import { ThemeProvider } from './ThemeToggle';
import { CartProvider } from './components/CartContext';
import CookieConsent from './components/CookieConsent';
import MobileMenu from './components/MobileMenu';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './context/authContext';
import Loading from './components/ui/Loading';

// Add this ProtectedRoute component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    return <Navigate to='/' replace />;
  }

  return children;
};

// Create a route wrapper component with loading
const RouteWrapper = ({ element }) => (
  <Suspense
    fallback={
      <div className='min-h-screen flex items-center justify-center'>
        <Loading />
      </div>
    }
  >
    {element}
  </Suspense>
);

// Lazy load all page components
const LazyHome = lazy(() => import('./pages/Home'));
const LazyProducts = lazy(() => import('./pages/Products'));
const LazyProfile = lazy(() => import('./pages/Profile'));
const LazyProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const LazyCart = lazy(() => import('./pages/Cart'));
const LazyProductPanel = lazy(() => import('./pages/ProductPanel'));
const LazyUserManagement = lazy(() => import('./services/UM'));

const AppContent = () => {
  const location = useLocation();
  const hideHeaderPaths = ['/login', '/signup'];
  const showHeader = !hideHeaderPaths.includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path='/' element={<RouteWrapper element={<LazyHome />} />} />
        <Route
          path='/collections'
          element={<RouteWrapper element={<LazyProducts />} />}
        />
        <Route
          path='/account'
          element={
            <ProtectedRoute>
              <RouteWrapper element={<LazyProfile />} />
            </ProtectedRoute>
          }
        />
        <Route
          path='/adminpanel'
          element={
            <ProtectedRoute requiredRole='admin'>
              <RouteWrapper element={<LazyUserManagement />} />
            </ProtectedRoute>
          }
        />
        <Route
          path='/manageproducts'
          element={
            <ProtectedRoute requiredRole='admin'>
              <RouteWrapper element={<LazyProductPanel />} />
            </ProtectedRoute>
          }
        />
        <Route
          path='/products/:id'
          element={<RouteWrapper element={<LazyProductDetailPage />} />}
        />
        <Route path='/cart' element={<RouteWrapper element={<LazyCart />} />} />
      </Routes>
      <MobileMenu />
    </>
  );
};
const App = () => {
  return (
    <ThemeProvider>
      <CartProvider storagePreference='both'>
        <Router>
          <AppContent />
          <CookieConsent />
          <Toaster />
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
