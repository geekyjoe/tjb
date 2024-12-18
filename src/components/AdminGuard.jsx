import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminGuard = ({ children }) => {
  const { isAdmin } = useAdminAuth();

  if (!isAdmin) {
    // Redirect to login page if not authenticated
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminGuard;