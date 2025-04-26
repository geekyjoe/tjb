import React, { useState, useEffect } from 'react';
import ProductsAPI from '../api/products'; // Assuming this is the file you shared

// Main ProductManagement component
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('list'); // list, create, edit, details
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    isActive: 'true'
  });

  // Check if user is admin
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setIsAdmin(parsedUser.role === "admin");
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    }
  }, []);

  // Load products on component mount and when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const filterParams = {};
        if (filters.category) filterParams.category = filters.category;
        if (filters.minPrice) filterParams.minPrice = parseFloat(filters.minPrice);
        if (filters.maxPrice) filterParams.maxPrice = parseFloat(filters.maxPrice);
        if (filters.isActive !== 'all') filterParams.isActive = filters.isActive === 'true';

        let data;
        if (isAdmin && filters.isActive === 'all') {
          data = await ProductsAPI.getAdminProductList();
        } else {
          data = await ProductsAPI.getAllProducts(filterParams);
        }
        setProducts(data.products || []);
      } catch (error) {
        setError(error.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [filters, isAdmin]);

  // Handler for filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handler for selecting a product
  const handleSelectProduct = async (productId) => {
    setIsLoading(true);
    setError(null);
    try {
      const product = await ProductsAPI.getProductById(productId);
      setSelectedProduct(product);
      setView('details');
    } catch (error) {
      setError(error.message || 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for toggling product status
  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      await ProductsAPI.toggleProductStatus(productId, !currentStatus);
      // Update products list after toggling status
      const updatedProducts = products.map(product => 
        product.id === productId ? { ...product, isActive: !currentStatus } : product
      );
      setProducts(updatedProducts);
    } catch (error) {
      setError(error.message || 'Failed to toggle product status');
    }
  };

  // Handler for deleting a product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await ProductsAPI.deleteProduct(productId);
        // Remove product from list after deletion
        setProducts(products.filter(product => product.id !== productId));
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(null);
          setView('list');
        }
      } catch (error) {
        setError(error.message || 'Failed to delete product');
      }
    }
  };

  // Return different view based on current state
  const renderView = () => {
    switch (view) {
      case 'create':
        return <ProductForm 
                 isAdmin={isAdmin} 
                 onSubmit={() => {
                   setView('list');
                   // Reload products list
                   ProductsAPI.getAllProducts(filters)
                     .then(data => setProducts(data.products || []))
                     .catch(err => setError(err.message));
                 }}
                 onCancel={() => setView('list')}
               />;
      case 'edit':
        return <ProductForm 
                 isAdmin={isAdmin} 
                 product={selectedProduct}
                 onSubmit={() => {
                   setView('details');
                   // Reload the product details
                   ProductsAPI.getProductById(selectedProduct.id)
                     .then(data => setSelectedProduct(data))
                     .catch(err => setError(err.message));
                 }}
                 onCancel={() => setView('details')}
               />;
      case 'details':
        return <ProductDetails 
                 product={selectedProduct}
                 isAdmin={isAdmin}
                 onEdit={() => setView('edit')}
                 onBack={() => {
                   setSelectedProduct(null);
                   setView('list');
                 }}
                 onToggleStatus={handleToggleStatus}
                 onDelete={handleDeleteProduct}
               />;
      case 'list':
      default:
        return <ProductList 
                 products={products}
                 isLoading={isLoading}
                 error={error}
                 onSelectProduct={handleSelectProduct}
                 onToggleStatus={handleToggleStatus}
                 onDeleteProduct={handleDeleteProduct}
                 isAdmin={isAdmin}
               />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-cornsilk">
      <h1 className='font-semibold leading-7'>Product Management</h1>
      
      {/* Filter and action bar */}
      <div className="flex justify-between">
        {view === 'list' && (
          <>
            <div className="filters">
              <select 
                name="category" 
                value={filters.category} 
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="home">Home</option>
                <option value="books">Books</option>
              </select>
              
              <input 
                type="number" 
                name="minPrice" 
                placeholder="Min Price" 
                value={filters.minPrice} 
                onChange={handleFilterChange}
              />
              
              <input 
                type="number" 
                name="maxPrice" 
                placeholder="Max Price" 
                value={filters.maxPrice} 
                onChange={handleFilterChange}
              />
              
              <select 
                name="isActive" 
                value={filters.isActive} 
                onChange={handleFilterChange}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
                {isAdmin && <option value="all">All</option>}
              </select>
            </div>
            
            {isAdmin && (
              <button 
                className="create-button" 
                onClick={() => setView('create')}
              >
                Add New Product
              </button>
            )}
          </>
        )}
      </div>
      
      {/* Main content area */}
      {renderView()}
    </div>
  );
};

// ProductList component for displaying all products
const ProductList = ({ 
  products, 
  isLoading, 
  error, 
  onSelectProduct, 
  onToggleStatus, 
  onDeleteProduct, 
  isAdmin 
}) => {
  if (isLoading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
  return (
    <div className="product-list">
      {products.length === 0 ? (
        <div className="no-products">No products found</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Inventory</th>
              {isAdmin && <th>Status</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={!product.isActive ? 'inactive' : ''}>
                <td>{product.title}</td>
                <td>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.inventory}</td>
                {isAdmin && (
                  <td>
                    <span className={product.isActive ? 'status-active' : 'status-inactive'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                )}
                <td className="actions">
                  <button 
                    className="view-button" 
                    onClick={() => onSelectProduct(product.id)}
                  >
                    View
                  </button>
                  
                  {isAdmin && (
                    <>
                      <button 
                        className="toggle-button" 
                        onClick={() => onToggleStatus(product.id, product.isActive)}
                      >
                        {product.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button 
                        className="delete-button" 
                        onClick={() => onDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ProductDetails component for viewing a single product
const ProductDetails = ({ 
  product, 
  isAdmin, 
  onEdit, 
  onBack, 
  onToggleStatus, 
  onDelete 
}) => {
  if (!product) return null;
  
  return (
    <div className="product-details">
      <div className="product-header">
        <h2>{product.title}</h2>
        <div className="product-actions">
          <button className="back-button" onClick={onBack}>
            Back to List
          </button>
          
          {isAdmin && (
            <>
              <button className="edit-button" onClick={onEdit}>
                Edit Product
              </button>
              
              <button 
                className="toggle-button" 
                onClick={() => onToggleStatus(product.id, product.isActive)}
              >
                {product.isActive ? 'Deactivate' : 'Activate'}
              </button>
              
              <button 
                className="delete-button" 
                onClick={() => onDelete(product.id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="product-info">
        <div className="product-images">
          {product.images && product.images.length > 0 ? (
            <>
              <div className="main-image">
                <img 
                  src={product.images[product.thumbnailIndex || 0]} 
                  alt={product.title} 
                />
              </div>
              
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${index === (product.thumbnailIndex || 0) ? 'active' : ''}`}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} />
                    {isAdmin && (
                      <div className="thumbnail-actions">
                        <button onClick={() => handleSetThumbnail(product.id, index)}>
                          Set as Main
                        </button>
                        <button onClick={() => handleDeleteImage(product.id, index)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-images">No images available</div>
          )}
          
          {isAdmin && <ProductImageUpload productId={product.id} />}
        </div>
        
        <div className="product-details-info">
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
          <p><strong>Inventory:</strong> {product.inventory}</p>
          <p><strong>Status:</strong> {product.isActive ? 'Active' : 'Inactive'}</p>
          <p><strong>Description:</strong></p>
          <p>{product.description || 'No description available'}</p>
        </div>
      </div>
    </div>
  );
};

// ProductForm component for creating and editing products
const ProductForm = ({ isAdmin, product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    inventory: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        price: product.price || '',
        category: product.category || '',
        description: product.description || '',
        inventory: product.inventory || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    }
  }, [product]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Only administrators can create or edit products');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare data for API
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        inventory: parseInt(formData.inventory, 10)
      };
      
      if (product) {
        // Update existing product
        await ProductsAPI.updateProduct(product.id, productData);
      } else {
        // Create new product
        await ProductsAPI.createProduct(productData);
      }
      
      onSubmit();
    } catch (error) {
      setError(error.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container">
      <h2>{product ? 'Edit Product' : 'Create New Product'}</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="title">Product Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home</option>
            <option value="books">Books</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="inventory">Inventory *</label>
          <input
            type="number"
            id="inventory"
            name="inventory"
            value={formData.inventory}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>
        
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Active Product
          </label>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={onCancel}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

// ProductImageUpload component for handling image uploads
const ProductImageUpload = ({ productId }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [setAsThumbnail, setSetAsThumbnail] = useState(false);
  
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };
  
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      await ProductsAPI.uploadProductImages(
        productId, 
        files, 
        setAsThumbnail ? 0 : null
      );
      
      // Reset state after successful upload
      setFiles([]);
      setSetAsThumbnail(false);
      
      // Refresh product details (This would need to be implemented at parent level)
      // We'd typically update the product details here
    } catch (error) {
      setError(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="image-upload-container">
      <h3>Upload Product Images</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="file-input">
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleFileChange} 
        />
        
        <div className="selected-files">
          {files.length > 0 ? (
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          ) : (
            <p>No files selected</p>
          )}
        </div>
      </div>
      
      <div className="upload-options">
        <label>
          <input
            type="checkbox"
            checked={setAsThumbnail}
            onChange={() => setSetAsThumbnail(!setAsThumbnail)}
          />
          Set first uploaded image as thumbnail
        </label>
      </div>
      
      <button 
        className="upload-button" 
        onClick={handleUpload} 
        disabled={isUploading || files.length === 0}
      >
        {isUploading ? 'Uploading...' : 'Upload Images'}
      </button>
    </div>
  );
};

// Helper functions for image management
const handleSetThumbnail = async (productId, imageIndex) => {
  try {
    await ProductsAPI.setProductThumbnail(productId, imageIndex);
    // We'd typically update the product details here
    alert('Thumbnail updated successfully');
  } catch (error) {
    alert(error.message || 'Failed to update thumbnail');
  }
};

const handleDeleteImage = async (productId, imageIndex) => {
  if (window.confirm('Are you sure you want to delete this image?')) {
    try {
      await ProductsAPI.deleteProductImage(productId, imageIndex);
      // We'd typically update the product details here
      alert('Image deleted successfully');
    } catch (error) {
      alert(error.message || 'Failed to delete image');
    }
  }
};

export default ProductManagement;