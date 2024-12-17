import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Cart from './pages/Cart';
import AdminPanel from './components/AdminPanel';
import { DarkModeProvider } from './DarkModeToggle';
import { CartProvider } from './components/CartContext.jsx'; // Add this import
import Products from './pages/Products';
import AdminLogin from './components/AdminLogin';
import Admin from './pages/Admin';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminGuard from './components/AdminGuard.jsx'
import AdminSignup from './components/AdminSignup.jsx';

const App = () => {
  return (
    <AdminAuthProvider>
    <DarkModeProvider>
      <CartProvider> {/* Wrap everything with CartProvider */}
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
          </Routes>
        </Router>
      </CartProvider>
    </DarkModeProvider>
    </AdminAuthProvider>
  );
};

export default App;