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
import { Toaster } from './components/ui/toaster';
import { useAuth } from './context/authContext';
import Loading from './components/ui/Loading';
import Footer from './components/Footer';
import TouchStateDemo from './pages/TouchStateDemo';

// Add this ProtectedRoute component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className='fixed inset-0 bg-black/20 backdrop-blur-sm z-50'>
        <Loading />
      </div>
    );
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
      <div className='fixed inset-0 bg-black/20 backdrop-blur-sm z-50'>
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
const LazyOrder = lazy(() => import('./pages/Orders'));
const LazyProductPanel = lazy(() => import('./pages/ProductPanel'));
const LazyUserManagement = lazy(() => import('./services/UM'));
const LazyNotFound = lazy(() => import('./pages/NotFound'));

const Contents = () => {
  const location = useLocation();
  const hideHeaderPaths = ['/login', '/signup'];
  const showHeader =
    (!hideHeaderPaths.includes(location.pathname) &&
      location.pathname !== '*' &&
      !location.pathname.match(/^\/.*/)) ||
    hideHeaderPaths.includes(location.pathname);

  // Check if current path matches any defined routes
  const isValidRoute =
    [
      '/',
      '/collections',
      '/account',
      '/orders',
      '/adminpanel',
      '/manageproducts',
      '/touch',
    ].includes(location.pathname) ||
    location.pathname.startsWith('/collections/');

  const showHeaderAndFooter =
    !hideHeaderPaths.includes(location.pathname) && isValidRoute;

  return (
    <>
      {showHeaderAndFooter && <Header />}
      <Routes>
        <Route path='/' element={<RouteWrapper element={<LazyHome />} />} />
        <Route
          path='/touch'
          element={<RouteWrapper element={<TouchStateDemo />} />}
        />
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
          path='/orders'
          element={
            <ProtectedRoute>
              <RouteWrapper element={<LazyOrder />} />
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
          path='/collections/:id'
          element={<RouteWrapper element={<LazyProductDetailPage />} />}
        />
        {/* <Route path='/cart' element={<RouteWrapper element={<LazyCart />} />} /> */}
        {/* 404 catch-all route - must be last */}
        <Route path='*' element={<RouteWrapper element={<LazyNotFound />} />} />
      </Routes>
      {showHeaderAndFooter && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <CartProvider storagePreference='both'>
        <Router>
          <Contents />
          <CookieConsent />
          <Toaster />
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
