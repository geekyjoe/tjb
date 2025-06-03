import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import { ThemeProvider } from "./ThemeToggle";
import { CartProvider } from "./components/CartContext";
import Products from "./pages/Products";
import ProductDetailPage from "./pages/ProductDetailPage";
import Profile from "./pages/Profile";
import CookieConsent from "./components/CookieConsent";
import UserManagement from "./services/UM";
import MobileMenu from "./components/MobileMenu";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from "./context/authContext";
import Loading from "./components/ui/Loading";

// Add this ProtectedRoute component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const ProductPanel = lazy(() => import("./pages/ProductPanel"));

4856;
const AppContent = () => {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/signup"];
  const showHeader = !hideHeaderPaths.includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Products />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminpanel"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manageproducts"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                }
              >
                <ProductPanel />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<Cart />} />
        {/* <Route path="/signup" element={<UserSignup />} />
        <Route path="/login" element={<UserLogin />} /> */}
      </Routes>
      <MobileMenu />
    </>
  );
};
const App = () => {
  return (
    <ThemeProvider>
      <CartProvider storagePreference="both">
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
