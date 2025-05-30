import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Upload,
  X,
  AlertTriangle,
  Package,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader,
} from "lucide-react";
import productAPI from "../api/products"; // Your API file

// At the top of the file with other imports
// Add this validation function near the top of the file, after imports

const validateProduct = (product, isUpdate = false) => {
  const requiredFields = ["name", "productType", "price"];

  if (!isUpdate) {
    requiredFields.push("description");
  }

  const missingFields = requiredFields.filter(
    (field) =>
      !product.hasOwnProperty(field) ||
      product[field] === null ||
      product[field] === undefined ||
      product[field] === ""
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate price is a number
  if (
    product.price &&
    (typeof product.price !== "number" || product.price < 0)
  ) {
    throw new Error("Price must be a positive number");
  }

  return true;
};
// Create Product Context
const ProductContext = createContext();

const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};

// Product Provider Component
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    search: "",
    productType: "",
    category: "",
    status: "active",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit: pagination.itemsPerPage,
          ...filters,
        };
        const response = await productAPI.getAllProducts(params);
        setProducts(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.itemsPerPage]
  );

  const createProduct = async (productData, images) => {
    try {
      const response = await productAPI.createProduct(productData, images);
      await fetchProducts(pagination.currentPage);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const updateProduct = async (
    productId,
    productData,
    images,
    replaceAllImages = false
  ) => {
    try {
      const response = await productAPI.updateProduct(
        productId,
        productData,
        images,
        replaceAllImages
      );
      await fetchProducts(pagination.currentPage);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const response = await productAPI.deleteProduct(productId);
      await fetchProducts(pagination.currentPage);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const bulkDelete = async (productIds) => {
    try {
      const response = await productAPI.bulkOperations("delete", productIds);
      await fetchProducts(pagination.currentPage);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const searchProducts = async (query) => {
    try {
      const response = await productAPI.searchProducts(query);
      setProducts(response.data);
      setPagination((prev) => ({ ...prev, totalItems: response.data.length }));
      return response;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [filters]);

  const value = {
    products,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDelete,
    searchProducts,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

// Dialog Component (Radix UI style)
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

// Alert Dialog Component
const AlertDialog = ({ open, onOpenChange, onConfirm, title, description }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Form Component
const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    productType: product?.productType || "",
    price: product?.price || 0,
    currency: product?.currency || "USD",
    status: product?.status || "active",
    inventory: {
      quantity: product?.inventory?.quantity || 0,
      unit: product?.inventory?.unit || "pieces",
      lowStockThreshold: product?.inventory?.lowStockThreshold || 5,
    },
    categories: product?.categories || [],
    tags: product?.tags || [],
    attributes: product?.attributes || {},
    seo: {
      slug: product?.seo?.slug || "",
      metaTitle: product?.seo?.metaTitle || "",
      metaDescription: product?.seo?.metaDescription || "",
      keywords: product?.seo?.keywords || [],
    },
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const addCategory = () => {
    if (
      categoryInput.trim() &&
      !formData.categories.includes(categoryInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()],
      }));
      setCategoryInput("");
    }
  };

  const removeCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure price is a number
      const formattedData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
      };
      await onSave(formattedData, images);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {product ? "Edit Product" : "Add Product"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Product Type *
          </label>
          <select
            value={formData.productType}
            onChange={(e) => handleInputChange("productType", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Type</option>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price *</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              handleInputChange("price", parseFloat(e.target.value) || 0)
            }
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            value={formData.inventory.quantity}
            onChange={(e) =>
              handleInputChange(
                "inventory.quantity",
                parseInt(e.target.value) || 0
              )
            }
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Unit</label>
          <input
            type="text"
            value={formData.inventory.unit}
            onChange={(e) =>
              handleInputChange("inventory.unit", e.target.value)
            }
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Low Stock Threshold
          </label>
          <input
            type="number"
            value={formData.inventory.lowStockThreshold}
            onChange={(e) =>
              handleInputChange(
                "inventory.lowStockThreshold",
                parseInt(e.target.value) || 0
              )
            }
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Categories</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            placeholder="Add category"
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addCategory())
            }
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.categories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {category}
              <button
                type="button"
                onClick={() => removeCategory(category)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag"
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {images.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {images.length} image(s) selected
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
};

// Product Card Component
const ProductCard = ({ product, onEdit, onDelete, onView }) => {
  const primaryImage =
    product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const isLowStock =
    product.inventory?.quantity <= product.inventory?.lowStockThreshold;

  return (
    <div className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
      <div className="relative">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </div>
        )}
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
            product.status === "active"
              ? "bg-green-100 text-green-800"
              : product.status === "inactive"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {product.status}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-blue-600">
            ${product.price} {product.currency}
          </span>
          <span className="text-sm text-gray-500 capitalize">
            {product.productType}
          </span>
        </div>

        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">
            Stock: {product.inventory?.quantity || 0}{" "}
            {product.inventory?.unit || "pcs"}
          </span>
          {product.categories?.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {product.categories[0]}
              {product.categories.length > 1 &&
                ` +${product.categories.length - 1}`}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            <button
              onClick={() => onView(product)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              title="View Product"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-green-600 hover:bg-green-50 rounded"
              title="Edit Product"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(product.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Product Detail View Component
const ProductDetailView = ({ product, onClose }) => {
  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {product.images && product.images.length > 0 ? (
            <div className="space-y-4">
              <img
                src={
                  product.images.find((img) => img.isPrimary)?.url ||
                  product.images[0].url
                }
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 2}`}
                      className="w-full h-16 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <Package className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Product Information</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Type:</span> {product.productType}
              </p>
              <p>
                <span className="font-medium">Price:</span> ${product.price}{" "}
                {product.currency}
              </p>
              <p>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${
                    product.status === "active"
                      ? "bg-green-100 text-green-800"
                      : product.status === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {product.status}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Inventory</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Quantity:</span>{" "}
                {product.inventory?.quantity || 0}{" "}
                {product.inventory?.unit || "pcs"}
              </p>
              <p>
                <span className="font-medium">Low Stock Threshold:</span>{" "}
                {product.inventory?.lowStockThreshold || 0}
              </p>
              {product.inventory?.quantity <=
                product.inventory?.lowStockThreshold && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Low Stock Alert</span>
                </div>
              )}
            </div>
          </div>

          {product.categories && product.categories.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {product.description && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t text-sm text-gray-500">
        <p>Created: {new Date(product.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(product.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

// Main Product Management Component
const ProductManagement = () => {
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDelete,
    searchProducts,
  } = useProducts();

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const handleSearch = (e) => {
    const query = e.target.value;
    setFilters((prev) => ({ ...prev, search: query }));
    if (query.trim()) {
      searchProducts(query);
    }
  };

  // Inside the ProductManagement component
  const handleCreateProduct = async (productData, images) => {
    try {
      // Validate the product data before submission
      validateProduct(productData, false);
      const response = await createProduct(productData, images);
      if (response.success) {
        console.log("Product created successfully");
        setShowForm(false);
      } else {
        throw new Error(response.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Create product error:", error);
    }
  };

  const handleUpdateProduct = async (productData, images) => {
    try {
      // Validate the product data before submission
      validateProduct(productData, true);
      const response = await updateProduct(
        selectedProduct.id,
        productData,
        images
      );
      if (response.success) {
        console.log("Product updated successfully");
        setShowForm(false);
        setSelectedProduct(null);
      } else {
        throw new Error(response.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Update product error:", error);
    }
  };

  // const handleCreateProduct = async (productData, images) => {
  //   try {
  //     await createProduct(productData, images);
  //     setShowForm(false);
  //   } catch (error) {
  //     alert("Failed to create product: " + error.message);
  //   }
  // };

  // const handleUpdateProduct = async (productData, images) => {
  //   try {
  //     await updateProduct(selectedProduct.id, productData, images);
  //     setShowForm(false);
  //     setSelectedProduct(null);
  //   } catch (error) {
  //     alert("Failed to update product: " + error.message);
  //   }
  // };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(selectedProduct.id);
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    } catch (error) {
      alert("Failed to delete product: " + error.message);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete(selectedProducts);
      setShowBulkDeleteDialog(false);
      setSelectedProducts([]);
    } catch (error) {
      alert("Failed to delete products: " + error.message);
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Management
              </h1>
              <p className="text-gray-600">Manage your product inventory</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Type
              </label>
              <select
                value={filters.productType}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    productType: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {/* Add categories dynamically or hardcoded */}
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Garden</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowBulkDeleteDialog(true)}
                disabled={selectedProducts.length === 0}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                  selectedProducts.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Bulk Delete
              </button>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: "createdAt",
                    sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
                  }))
                }
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Sort by Created At{" "}
                {filters.sortOrder === "asc" ? (
                  <ChevronUp className="inline" />
                ) : (
                  <ChevronDown className="inline" />
                )}
              </button>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: "price",
                    sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
                  }))
                }
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Sort by Price{" "}
                {filters.sortOrder === "asc" ? (
                  <ChevronUp className="inline" />
                ) : (
                  <ChevronDown className="inline" />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Product List */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {loading ? (
            <div className="text-center py-10">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-10">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={() => {
                        setSelectedProduct(product);
                        setShowForm(true);
                      }}
                      onDelete={(prod) => {
                        setSelectedProduct(prod);
                        setShowDeleteDialog(true);
                      }}
                      onView={(prod) => {
                        setSelectedProduct(prod);
                        setShowDetail(true);
                      }}
                    />
                  ))}
                </div>
              )}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={() => fetchProducts(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors ${
                      pagination.currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchProducts(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors ${
                      pagination.currentPage === pagination.totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {/* Product Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <ProductForm
            product={selectedProduct}
            onSave={selectedProduct ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => {
              setShowForm(false);
              setSelectedProduct(null);
            }}
          />
        </Dialog>
        {/* Product Detail View */}
        {showDetail && selectedProduct && (
          <Dialog open={showDetail} onOpenChange={setShowDetail}>
            <ProductDetailView
              product={selectedProduct}
              onClose={() => setShowDetail(false)}
            />
          </Dialog>
        )}
        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Product"
          description={`Are you sure you want to delete the product "${selectedProduct?.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteProduct}
        />
        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog
          open={showBulkDeleteDialog}
          onOpenChange={setShowBulkDeleteDialog}
          title="Bulk Delete Products"
          description={`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
        />
      </div>
    </div>
  );
};

export default ProductManagement;
