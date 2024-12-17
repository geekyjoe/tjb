import React, { createContext, useState, useContext } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const loginAdmin = () => {
    setIsAdmin(true);
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin }}>
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