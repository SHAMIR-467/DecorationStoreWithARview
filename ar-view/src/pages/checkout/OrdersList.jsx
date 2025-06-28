import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  AlertCircle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Box,
  ChevronRight,
  ShoppingBag,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { useSelector } from "react-redux";

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get auth token from Redux store
  const { accessToken, user } = useSelector((state) => state.auth);

  // API request configuration with auth token
  const apiConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await axios.get(
        `/api/orders/user?timestamp=${timestamp}`,
        apiConfig
      );

      // Handle different API response formats
      const data = response.data;
      const ordersData = Array.isArray(data) ? data : data.orders || [];

      setOrders(ordersData);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      await axios.put(`/api/orders/cancel/${orderId}`, {}, apiConfig);

      // Update the order status in the local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError(
        err.response?.data?.message ||
          "Failed to cancel the order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (orderId) => {
    navigate(`/feedback/${orderId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "Processing":
        return <Box className="w-5 h-5 text-blue-500" />;
      case "Shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "Delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatOrderId = (orderId) => {
    if (!orderId) return "Unknown";
    return orderId.substring(orderId.length - 8);
  };

  // Check if an order has feedback
  const hasFeedback = (order) => {
    return order.hasFeedback;
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          disabled={refreshing}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center mb-6">
          <AlertCircle className="text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {orders.length === 0 && !loading && !error ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mx-auto bg-gray-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <ShoppingBag className="text-gray-600 w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Orders Yet
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
            <div className="col-span-3 font-medium text-gray-700">Order ID</div>
            <div className="col-span-2 font-medium text-gray-700">Date</div>
            <div className="col-span-2 font-medium text-gray-700">Total</div>
            <div className="col-span-2 font-medium text-gray-700">Status</div>
            <div className="col-span-3 font-medium text-gray-700">Actions</div>
          </div>

          <div className={`divide-y ${refreshing ? "opacity-60" : ""}`}>
            {orders.map((order) => (
              <div key={order._id} className="p-4 hover:bg-gray-50">
                {/* Mobile view */}
                <div className="md:hidden space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Order #{formatOrderId(order._id)}
                    </span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </div>
                  <div className="font-medium">
                    Rs {parseFloat(order.totalAmount).toFixed(2)}
                  </div>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <Link
                      to={`/orders/user/${order._id}`}
                      className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                    {order.status === "Pending" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Desktop view */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 font-medium">
                    #{formatOrderId(order._id)}
                  </div>
                  <div className="col-span-2 text-gray-600">
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="col-span-2 font-medium">
                    Rs {parseFloat(order.totalAmount).toFixed(2)}
                  </div>
                  <div className="col-span-2">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </div>
                  </div>
                  <div className="col-span-3 flex flex-wrap gap-2">
                    <Link
                      to={`/orders/user/${order._id}`}
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200"
                    >
                      View Details <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>

                    {order.status === "Pending" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
