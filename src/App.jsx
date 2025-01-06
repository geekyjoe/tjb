import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import AdminPanel from "./components/AdminPanel";
import { ThemeProvider } from "./ThemeToggle";
import { CartProvider } from "./components/CartContext";
import Products from "./pages/Products";
import AdminLogin from "./components/AdminLogin";
import Admin from "./pages/Admin";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminGuard from "./components/AdminGuard";
import AdminSignup from "./components/AdminSignup";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductPanel from "./pages/ProductPanel";
import Profile from "./pages/Profile";
import CookieConsent from "./components/CookieConsent";

const App = () => {
  return (
    <AdminAuthProvider>
      <ThemeProvider>
        <CartProvider storagePreference="both">
          <Router>
            <Header />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/pp" element={<ProductPanel />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<Cart />} />

              {/* Admin Authentication Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-signup" element={<AdminSignup />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <Admin />
                  </AdminGuard>
                }
              />
              <Route
                path="/admin-panel"
                element={
                  <AdminGuard>
                    <AdminPanel />
                  </AdminGuard>
                }
              />
            </Routes>
            <CookieConsent />
          </Router>
        </CartProvider>
      </ThemeProvider>
    </AdminAuthProvider>
  );
};

export default App;
