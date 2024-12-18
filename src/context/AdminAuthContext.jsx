import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    // Validate token on initial load or token change
    const validateToken = async () => {
      if (adminToken) {
        try {
          const response = await fetch('/api/admin/validate-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });
          
          if (response.ok) {
            setIsAdmin(true);
          } else {
            // Token is invalid, clear it
            logout();
          }
        } catch (error) {
          console.error('Token validation failed', error);
          logout();
        }
      }
    };

    validateToken();
  }, [adminToken]);

  const login = (token) => {
    localStorage.setItem('adminToken', token);
    setAdminToken(token);
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ 
      isAdmin, 
      login, 
      logout,
      adminToken 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  
  if (context === null) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  return context;
};

export default AdminAuthContext;