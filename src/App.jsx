import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import { ThemeProvider } from "./ThemeToggle";
import { CartProvider } from "./components/CartContext";
import Products from "./pages/Products";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductPanel from "./pages/ProductPanel";
import Profile from "./pages/Profile";
import CookieConsent from "./components/CookieConsent";
import UserSignup from "./form/Signup";
import UserLogin from "./form/Login";
import UserManagement from "./services/UM";

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
        <Route path="/products" element={<Products />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/adminpanel" element={<UserManagement />} />
        <Route path="/pp" element={<ProductPanel />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/login" element={<UserLogin />} />
      </Routes>
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
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
