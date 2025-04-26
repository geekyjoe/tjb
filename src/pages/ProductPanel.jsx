import React, { useState, useEffect } from 'react';
import ProductsAPI from '../api/products';

const ProductManagement = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    isActive: 'true'
  });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    inventory: '',
    isActive: true
  });
  
  // Image upload state
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Check if user is admin on component mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setIsAdmin(parsedUser.role === "admin");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    // Load products
    fetchProducts();
  }, []);
  
  // Fetch products with current filters
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Format filters (remove empty values)
      const validFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') {
          validFilters[key] = value;
        }
      });
      
      // Use admin endpoint if user is admin
      let data;
      if (isAdmin) {
        data = await ProductsAPI.getAdminProductList();
      } else {
        data = await ProductsAPI.getAllProducts(validFilters);
      }
      
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    fetchProducts();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      isActive: 'true'
    });
    
    // Immediately fetch with reset filters
    fetchProducts();
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle image selection
  const handleImageSelect = (e) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };
  
  // Initialize form for creating a new product
  const handleAddNewClick = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      inventory: '',
      isActive: true
    });
    setSelectedImages([]);
    setShowForm(true);
  };
  
  // Initialize form for editing an existing product
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      inventory: product.inventory || '',
      isActive: product.isActive !== undefined ? product.isActive : true
    });
    setSelectedImages([]);
    setShowForm(true);
  };
  
  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Format form data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        inventory: parseInt(formData.inventory, 10)
      };
      
      let result;
      
      if (editingProduct) {
        // Update existing product
        result = await ProductsAPI.updateProduct(editingProduct._id, productData);
        
        // Handle image upload if images were selected
        if (selectedImages.length > 0) {
          await ProductsAPI.uploadProductImages(editingProduct._id, selectedImages);
        }
      } else {
        // Create new product
        result = await ProductsAPI.createProduct(productData);
        
        // Handle image upload if images were selected and product was created
        if (selectedImages.length > 0 && result.product && result.product._id) {
          await ProductsAPI.uploadProductImages(result.product._id, selectedImages);
        }
      }
      
      // Reset and refresh
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        inventory: '',
        isActive: true
      });
      setSelectedImages([]);
      fetchProducts();
      
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await ProductsAPI.deleteProduct(productId);
      // Refresh product list
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle product active status
  const handleToggleStatus = async (product) => {
    setLoading(true);
    setError(null);
    
    try {
      await ProductsAPI.toggleProductStatus(product._id, !product.isActive);
      // Refresh product list
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to update product status');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete product image
  const handleDeleteImage = async (productId, imageIndex) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await ProductsAPI.deleteProductImage(productId, imageIndex);
      // Refresh product list to show updated images
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete image');
    } finally {
      setLoading(false);
    }
  };
  
  // Set image as thumbnail
  const handleSetThumbnail = async (productId, imageIndex) => {
    setLoading(true);
    setError(null);
    
    try {
      await ProductsAPI.setProductThumbnail(productId, imageIndex);
      // Refresh product list
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to set thumbnail');
    } finally {
      setLoading(false);
    }
  };
  
  // Render categories dropdown based on existing products
  const renderCategoryOptions = () => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.map(category => (
      <option key={category} value={category}>{category}</option>
    ));
  };
  
  // If not admin, show limited view
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product._id} className="border rounded p-4">
              {product.thumbnailUrl && (
                <img 
                  src={product.thumbnailUrl} 
                  alt={product.title} 
                  className="w-full h-48 object-cover mb-2" 
                />
              )}
              <h2 className="text-xl font-semibold">{product.title}</h2>
              <p className="text-gray-600">{product.category}</p>
              <p className="font-bold">${product.price.toFixed(2)}</p>
              <p>{product.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
      
      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange}
              className="w-full border rounded p-2"
            >
              <option value="">All Categories</option>
              {renderCategoryOptions()}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Min Price</label>
            <input 
              type="number" 
              name="minPrice" 
              value={filters.minPrice} 
              onChange={handleFilterChange}
              className="w-full border rounded p-2"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Max Price</label>
            <input 
              type="number" 
              name="maxPrice" 
              value={filters.maxPrice} 
              onChange={handleFilterChange}
              className="w-full border rounded p-2"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              name="isActive" 
              value={filters.isActive} 
              onChange={handleFilterChange}
              className="w-full border rounded p-2"
            >
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
              <option value="all">All Products</option>
            </select>
          </div>
          
          <div className="md:col-span-4 flex space-x-2">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Apply Filters
            </button>
            <button 
              type="button" 
              onClick={resetFilters} 
              className="bg-gray-300 px-4 py-2 rounded"
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      
      {/* Add New Product Button */}
      <div className="mb-4">
        {!showForm ? (
          <button 
            onClick={handleAddNewClick}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add New Product
          </button>
        ) : (
          <button 
            onClick={() => setShowForm(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
      
      {/* Product Form */}
      {showForm && (
        <div className="mb-6 bg-white p-4 border rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <input 
                  type="text" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                  list="categories"
                />
                <datalist id="categories">
                  {renderCategoryOptions()}
                </datalist>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price ($) *</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleInputChange}
                  step="0.01" 
                  min="0" 
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Inventory *</label>
                <input 
                  type="number" 
                  name="inventory" 
                  value={formData.inventory} 
                  onChange={handleInputChange}
                  min="0" 
                  className="w-full border rounded p-2"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
                className="w-full border rounded p-2 h-32"
              />
            </div>
            
            <div>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  checked={formData.isActive} 
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Active (visible to customers)</span>
              </label>
            </div>
            
            {/* Image Upload */}
            {editingProduct && (
              <div>
                <label className="block text-sm font-medium mb-1">Upload Images</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageSelect}
                  className="w-full border rounded p-2"
                />
                
                {selectedImages.length > 0 && (
                  <div className="mt-2">
                    <p>{selectedImages.length} images selected</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Products List */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Products List ({products.length})</h2>
        
        {loading && !showForm ? (
          <div className="text-center p-4">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Inventory</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className="border-t">
                    <td className="p-3">
                      {product.thumbnailUrl ? (
                        <img 
                          src={product.thumbnailUrl} 
                          alt={product.title} 
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="p-3">{product.title}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">${product.price.toFixed(2)}</td>
                    <td className="p-3">{product.inventory}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(product)}
                          className={`px-2 py-1 rounded text-xs ${product.isActive ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}
                        >
                          {product.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {products.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-4 text-center">
                      No products found. Try adjusting your filters or add a new product.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Product Images Management - Show when editing a product */}
      {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Product Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {editingProduct.images.map((image, index) => (
              <div key={index} className="border rounded p-2 relative">
                <img 
                  src={image.url} 
                  alt={`Product ${index + 1}`} 
                  className="w-full h-32 object-cover"
                />
                <div className="flex justify-between mt-2">
                  <button 
                    onClick={() => handleSetThumbnail(editingProduct._id, index)}
                    className={`px-2 py-1 text-xs rounded ${image.isThumbnail ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
                    disabled={image.isThumbnail}
                  >
                    {image.isThumbnail ? 'Thumbnail' : 'Set as Thumbnail'}
                  </button>
                  <button 
                    onClick={() => handleDeleteImage(editingProduct._id, index)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;