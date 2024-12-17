import React, { useState } from 'react';
import { adminSignup } from '../api/api';

const AdminSignup = () => {
  const [data, setData] = useState({ username: '', password: '', email: '' });
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    try {
      await adminSignup(data);
      setMessage('Admin account created successfully!');
    } catch (err) {
      setMessage('Signup failed.');
    }
  };

  return (
    <div className="flex flex-col p-4 bg-gray-100">
      <h2>Admin Signup</h2>
      {message && <p>{message}</p>}
      <input
        type="text"
        placeholder="Username"
        value={data.username}
        onChange={(e) => setData({ ...data, username: e.target.value })}
        className="border p-2 m-2"
      />
      <input
        type="email"
        placeholder="Email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        className="border p-2 m-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={data.password}
        onChange={(e) => setData({ ...data, password: e.target.value })}
        className="border p-2 m-2"
      />
      <button onClick={handleSignup} className="bg-green-500 text-white p-2 m-2">Signup</button>
    </div>
  );
};

export default AdminSignup;
