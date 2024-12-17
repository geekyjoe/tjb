import React, { useState } from 'react';
import { addProduct } from '../api/api';

const AdminPanel = () => {
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    description: '',
  });

  const handleAddProduct = async () => {
    try {
      const response = await addProduct(newProduct);
      console.log('Product added:', response);
      alert('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div className="flex flex-col bg-red-200">
      <h2 className='flex justify-center p-2'>Admin Panel</h2>
      <input
        className='p-2 border-2 m-1'
        type="text"
        placeholder="Title"
        value={newProduct.title}
        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
      />
      <input
        className='p-2 border-2 m-1'
        type="number"
        placeholder="Price"
        value={newProduct.price}
        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
      />
      <textarea
        placeholder="Description"
        value={newProduct.description}
        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
      />
      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
};

export default AdminPanel;