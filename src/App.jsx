import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import AdminPanel from "./components/AdminPanel";
import { DarkModeProvider } from "./DarkModeToggle";
import { CartProvider } from "./components/CartContext";
import Products from "./pages/Products";
import AdminLogin from "./components/AdminLogin";
import Admin from "./pages/Admin";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminGuard from "./components/AdminGuard";
import AdminSignup from "./components/AdminSignup";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductPanel from "./pages/ProductPanel";

const App = () => {
  return (
    <AdminAuthProvider>
      <DarkModeProvider>
        <CartProvider storagePreference="both">
          <Router>
            <Header />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
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
          </Router>
        </CartProvider>
      </DarkModeProvider>
    </AdminAuthProvider>
  );
};

export default App;
