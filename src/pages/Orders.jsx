import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  X,
  AlertCircle,
  Calendar,
  CreditCard,
  MapPin
} from 'lucide-react';

// Mock data for demonstration
const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-06-15',
    status: 'delivered',
    total: 299.99,
    items: 3,
    trackingNumber: 'TRK123456789',
    shippingAddress: '123 Main St, New York, NY 10001',
    paymentMethod: 'Credit Card ending in 4532',
    estimatedDelivery: '2024-06-18',
    actualDelivery: '2024-06-17',
    products: [
      { name: 'Wireless Headphones', quantity: 1, price: 199.99, image: '/api/placeholder/60/60' },
      { name: 'Phone Case', quantity: 2, price: 50.00, image: '/api/placeholder/60/60' }
    ]
  },
  {
    id: 'ORD-2024-002',
    date: '2024-06-18',
    status: 'shipped',
    total: 159.99,
    items: 2,
    trackingNumber: 'TRK987654321',
    shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
    paymentMethod: 'PayPal',
    estimatedDelivery: '2024-06-22',
    products: [
      { name: 'Bluetooth Speaker', quantity: 1, price: 129.99, image: '/api/placeholder/60/60' },
      { name: 'USB Cable', quantity: 1, price: 30.00, image: '/api/placeholder/60/60' }
    ]
  },
  {
    id: 'ORD-2024-003',
    date: '2024-06-20',
    status: 'processing',
    total: 89.99,
    items: 1,
    shippingAddress: '789 Pine St, Chicago, IL 60601',
    paymentMethod: 'Credit Card ending in 7890',
    estimatedDelivery: '2024-06-25',
    products: [
      { name: 'Fitness Tracker', quantity: 1, price: 89.99, image: '/api/placeholder/60/60' }
    ]
  },
  {
    id: 'ORD-2024-004',
    date: '2024-06-21',
    status: 'cancelled',
    total: 449.99,
    items: 1,
    shippingAddress: '321 Elm St, Miami, FL 33101',
    paymentMethod: 'Credit Card ending in 1234',
    cancelledDate: '2024-06-21',
    products: [
      { name: 'Laptop Stand', quantity: 1, price: 449.99, image: '/api/placeholder/60/60' }
    ]
  }
];

const Orders = ({ 
  orders = mockOrders, 
  onCancelOrder = () => {}, 
  onTrackOrder = () => {},
  onViewOrderDetails = () => {},
  className = ""
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium capitalize";
    const statusClasses = {
      processing: "bg-yellow-100 text-yellow-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    return `${baseClasses} ${statusClasses[status] || "bg-gray-100 text-gray-800"}`;
  };

  const canCancelOrder = (status) => {
    return status === 'processing' || status === 'shipped';
  };

  const handleCancelOrder = async (orderId) => {
    setCancellingOrder(orderId);
    try {
      await onCancelOrder(orderId);
      // In a real app, you'd update the order status or refetch orders
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setCancellingOrder(null);
    }
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  const OrderDetailsModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-lg">{order.id}</h3>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ordered on {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className={getStatusBadge(order.status)}>{order.status}</span>
              </div>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Tracking Information</h4>
              <p className="text-sm text-gray-600">Tracking Number: {order.trackingNumber}</p>
              {order.estimatedDelivery && (
                <p className="text-sm text-gray-600">
                  Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <div>
            <h4 className="font-medium mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.products.map((product, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{product.name}</h5>
                    <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h4>
              <p className="text-sm text-gray-600">{order.shippingAddress}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Method
              </h4>
              <p className="text-sm text-gray-600">{order.paymentMethod}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className} p-5`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Orders</h1>
        
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium">Filter:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet."
                : `No ${filterStatus} orders found.`
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{order.id}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={getStatusBadge(order.status)}>{order.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                    <span>{order.items} item{order.items !== 1 ? 's' : ''}</span>
                    <span className="font-medium text-gray-900">${order.total.toFixed(2)}</span>
                  </div>

                  {order.trackingNumber && (
                    <p className="text-sm text-blue-600">
                      Tracking: {order.trackingNumber}
                    </p>
                  )}

                  {order.status === 'cancelled' && order.cancelledDate && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Cancelled on {new Date(order.cancelledDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>

                  {order.trackingNumber && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => onTrackOrder(order.trackingNumber)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Track Order
                    </button>
                  )}

                  {canCancelOrder(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrder === order.id}
                      className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default Orders;