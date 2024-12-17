import React, { useState } from 'react';
import { adminLogin } from '../api/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { loginAdmin } = useAdminAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await adminLogin(credentials);
      if (response && response.token) {
        loginAdmin();
        localStorage.setItem('adminToken', response.token); // Persist admin login
        navigate('/admin');
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex flex-col p-4 bg-gray-100">
      <h2>Admin Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={credentials.username}
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        className="border p-2 m-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        className="border p-2 m-2"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2 m-2">Login</button>
    </div>
  );
};

export default AdminLogin;
