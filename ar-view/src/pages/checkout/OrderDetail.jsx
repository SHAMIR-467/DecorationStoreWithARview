import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Package,
  ArrowLeft,
  AlertCircle,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Box,
  MapPin,
  Copy,
  CalendarClock,
} from "lucide-react";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/orders/user/${orderId}`);
        setOrder(response.data.order);
        setOrderDetails(response.data.orderDetails);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setLoading(true);
      await axios.put(`/api/orders/cancel/${orderId}`);
      // Refresh order data
      const response = await axios.get(`/api/orders/user/${orderId}`);
      setOrder(response.data.order);
      setOrderDetails(response.data.orderDetails);
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError(
        err.response?.data?.message ||
          "Failed to cancel order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="text-yellow-500 mr-3" />
          <p className="text-yellow-700">Order not found.</p>
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Orders
        </button>
        <h1 className="text-2xl font-bold text-center flex-1 pr-8">
          Order Details
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="flex items-center mb-1">
                  <h2 className="text-lg font-semibold">
                    Order #{order._id.substring(order._id.length - 8)}
                  </h2>
                  <button
                    onClick={() => copyToClipboard(order._id)}
                    className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    title="Copy full order ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copied && (
                    <span className="text-xs text-green-600 ml-1">Copied!</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 flex items-center">
                  <CalendarClock className="w-4 h-4 mr-1" />
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                <span className="ml-1">{order.status}</span>
              </div>
            </div>

            {order.trackingInfo && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-start">
                  <Truck className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Tracking Information
                    </p>
                    <p className="text-blue-700">
                      {order.trackingInfo.courier}:{" "}
                      {order.trackingInfo.trackingNumber}
                    </p>
                    {order.trackingInfo.url && (
                      <a
                        href={order.trackingInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Track Your Package
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <h3 className="font-semibold text-gray-700 mb-3">
              Items in your order
            </h3>
            <div className="space-y-4">
              {orderDetails.map((detail) => (
                <div key={detail._id} className="flex border-b pb-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                    <img
                      src={
                        detail.product.images && detail.product.images[0]
                          ? detail.product.images[0]?.url
                          : "/api/placeholder/64/64"
                      }
                      alt={detail.product.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <Link
                        to={`/home/product/${detail.product._id}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {detail.product.productName}
                      </Link>
                      <span className="font-semibold">
                        RS : {detail.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Quantity: {detail.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Subtotal: RS :{" "}
                      {(detail.price * detail.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>RS : 250.00</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t mt-2">
                  <span>Total Amount</span>
                  <span>RS : {order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-500" /> Shipping
                  Address
                </h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">
                    {order.shippingDetails.fullName}
                  </p>
                  <p>{order.shippingDetails.addressLine1}</p>
                  {order.shippingDetails.addressLine2 && (
                    <p>{order.shippingDetails.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingDetails.city}, {order.shippingDetails.state}{" "}
                    {order.shippingDetails.postalCode}
                  </p>
                  <p>Phone: {order.shippingDetails.phoneNumber}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-1 text-gray-500" /> Payment
                  Information
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    Method:{" "}
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentMethod}
                  </p>
                  <p>Status: {order.paymentStatus || "Pending"}</p>
                  {order.paymentMethod === "COD" && (
                    <p className="text-gray-600 mt-2">
                      Payment will be collected upon delivery
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="font-semibold text-gray-700 mb-4">Order Updates</h3>
            <div className="space-y-4">
              {order.notifications &&
                order.notifications.map((notification, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4 relative">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      {index < order.notifications.length - 1 && (
                        <div className="absolute top-3 bottom-0 left-1.5 w-0.5 -ml-px bg-gray-200 h-full"></div>
                      )}
                    </div>
                    <div className="pb-4">
                      <p>{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-8">
            <h3 className="font-semibold text-gray-700 mb-4">Order Actions</h3>
            <button
              onClick={() =>
                navigate(
                  `/order-tracking?trackingNumber=${encodeURIComponent(
                    order._id
                  )}`
                )
              }
              className="w-full mb-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <Truck className="w-4 h-4 mr-2" />
              Track Order
            </button>

            {(order.status === "Pending" || order.status === "Processing") && (
              <button
                onClick={handleCancelOrder}
                className="w-full mb-4 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel Order
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="w-full mb-4 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Print Order Details
            </button>

            <Link
              to="/contact"
              className="w-full block text-center bg-blue-100 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            >
              Need Help? Contact Us
            </Link>
          </div>

          {/* Need Help Section */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="font-semibold text-gray-700 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions or issues with your order, our customer
              support team is here to help.
            </p>
            <div className="text-sm space-y-2">
              <p>
                <span className="font-medium">Email:</span>{" "}
                support@yourstore.com
              </p>

              <p>
                <span className="font-medium">Hours:</span> 9 AM - 6 PM, Monday
                to Saturday
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
