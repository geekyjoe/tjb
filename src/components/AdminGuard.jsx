import { useAdminAuth } from '../context/AdminAuthContext';
import { Navigate } from 'react-router-dom';

const AdminGuard = ({ children }) => {
  const { isAdmin } = useAdminAuth();

  return isAdmin ? children : <Navigate to="/admin-login" />;
};

export default AdminGuard;
