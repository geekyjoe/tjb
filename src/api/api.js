import axios from 'axios';

const BASE_URL = 'https://fakestoreapi.com';

export const fetchProducts = async () => {
  const response = await axios.get(`${BASE_URL}/products`);
  return response.data;
};

export const addProduct = async (productData) => {
  const response = await axios.post(`${BASE_URL}/products`, productData);
  return response.data;
};

export const fetchUser = async (id) => {
  const response = await axios.get(`${BASE_URL}/users/${id}`);
  return response.data;
};

// Admin Login
export const adminLogin = async (credentials) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
  return response.data;
};

// Admin Signup (Mock example for now)
export const adminSignup = async (data) => {
  const response = await axios.post(`${BASE_URL}/auth/signup`, data);
  return response.data;
};