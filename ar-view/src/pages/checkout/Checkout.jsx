import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  CreditCard,
  Truck,
  Package,
  ArrowLeft,
  AlertCircle,
  Plus,
  Minus,
  X,
  CheckCircle,
} from "lucide-react";

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract quantity from URL params if available
  const queryParams = new URLSearchParams(location.search);
  const initialQuantity = parseInt(queryParams.get("quantity")) || 1;

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan", // Default country
    paymentMethod: "COD", // Default payment method
  });
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderReference, setOrderReference] = useState(null);

  const DELIVERY_CHARGES = 250;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Add cache-busting parameter
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/product/${id}?_t=${timestamp}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        if (response.data.success) {
          setProduct(response.data.product);
        } else {
          setError("Failed to load product details. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load product details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const calculateSubtotal = () => {
    if (!product) return 0;
    return (product.discountedPrice || product.price) * quantity;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + DELIVERY_CHARGES;
  };

  const handlePlaceOrder = () => {
    setShowFormModal(true);
  };

  const closeModal = () => {
    setShowFormModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product) return;

    try {
      setOrderProcessing(true);

      // Create a combined address from line1 and line2
      const completeAddress = formData.addressLine2
        ? `${formData.address}, ${formData.addressLine2}`
        : formData.address;

      const orderData = {
        items: [
          {
            productId: product._id,
            quantity: quantity,
            price: product.discountedPrice || product.price,
          },
        ],
        totalAmount: calculateTotal(),
        paymentMethod: formData.paymentMethod,
        shippingDetails: {
          fullName: formData.fullName,
          phone: formData.phone, // Changed from phoneNumber to phone
          address: completeAddress, // Combined address
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country, // Added country field
        },
      };

      const response = await axios.post("/api/orders/create", orderData);

      setOrderSuccess(true);
      setOrderReference(response.data.order._id);
      setShowFormModal(false);

      // Wait 3 seconds and redirect to order details
      setTimeout(() => {
        navigate(`/orders/user/${response.data.order._id}`);
      }, 3000);
    } catch (err) {
      console.error("Error creating order:", err);
      setError(
        err.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setOrderProcessing(false);
    }
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
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Go Back
        </button>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle className="text-green-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-green-600 mb-4">
            Your order has been received and is being processed.
          </p>
          <p className="text-gray-600 mb-6">
            Order Reference:{" "}
            <span className="font-mono font-semibold">{orderReference}</span>
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(`/orders/user/${orderReference}`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Order Details
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <h1
          className="text-blue text-2xl md:text-3xl font-extrabold 
                    tracking-wide shadow-sm"
        >
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left side - Product summary */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="mr-2 w-5 h-5 text-blue-600" />
              Order Summary
            </h2>

            {product && (
              <div className="flex border-b pb-4 mb-4">
                <div className="w-20 h-20 rounded-md overflow-hidden mr-4">
                  <img
                    src={
                      product.images && product.images[0]?.url
                        ? `${product.images[0].url}?_t=${new Date().getTime()}`
                        : "/api/placeholder/80/80"
                    }
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{product.productName}</h3>
                  <p className="text-gray-500 text-sm">
                    {product.description &&
                      product.description.substring(0, 100)}
                    {product.description && product.description.length > 100
                      ? "..."
                      : ""}
                  </p>
                  <div className="flex justify-between mt-2">
                    <p className="font-semibold">
                      RS {(product.discountedPrice || product.price).toFixed(2)}
                    </p>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={handleDecrement}
                        className={`text-black bg-transparent px-3 py-1 transition duration-300 hover:bg-red-50 ${
                          quantity === 1 ? "cursor-not-allowed opacity-50" : ""
                        }`}
                        disabled={quantity === 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="text-center px-3">{quantity}</div>
                      <button
                        onClick={handleIncrement}
                        className={`text-black bg-transparent px-3 py-1 transition duration-300 hover:bg-green-50 ${
                          product && quantity >= product.stock
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        disabled={product && quantity >= product.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>RS {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>RS {DELIVERY_CHARGES.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t mt-2">
                <span>Total Amount</span>
                <span>RS {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Truck className="w-4 h-4 mr-2 text-green-600" />
              Estimated delivery within 3-5 business days
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              We deliver to most locations across the country
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Place Order
            </button>
          </div>
        </div>

        {/* Right side - Order summary and checkout button (sticky on desktop) */}
        <div className="hidden md:block">
          <div className="bg-white rounded-lg shadow p-6 sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Order Total</h2>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>RS {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>RS {DELIVERY_CHARGES.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total</span>
                <span>RS {calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="mb-4 flex items-center text-sm text-gray-600">
                <Truck className="w-4 h-4 mr-2 text-green-600" />
                Estimated delivery within 3-5 business days
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Complete Your Order</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Shipping Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="mr-2 w-5 h-5 text-blue-600" />
                  Shipping Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1*
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your street address"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City*
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State*
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code*
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your postal code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country*
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="mr-2 w-5 h-5 text-blue-600" />
                  Payment Method
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer bg-blue-50 border-blue-200">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">
                        Pay when you receive your order
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online"
                      checked={formData.paymentMethod === "Online"}
                      onChange={handleInputChange}
                      className="mr-2"
                      disabled
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-400">
                        Online Payment (Coming Soon)
                      </p>
                      <p className="text-sm text-gray-400">
                        Pay using easypaisa or bank transfer
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal:</span>
                  <span>RS {calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Delivery Fee:</span>
                  <span>RS {DELIVERY_CHARGES.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t mt-2">
                  <span>Total:</span>
                  <span>RS {calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {orderProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
