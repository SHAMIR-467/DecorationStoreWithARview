import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, incrementQuantity, decrementQuantity } from '../../assets/reducx/slices/cartSlice';
import { useNavigate } from 'react-router-dom'; // For navigation to product detail
import { ClipLoader } from 'react-spinners'; // Spinner for loading
import GiphyEmbed from '../../assets/css/loader'
const CartPage = () => {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleIncrease = (id) => {
    dispatch(incrementQuantity(id));
  };

  const handleDecrease = (id, quantity) => {
    if (quantity > 1) {
      dispatch(decrementQuantity(id));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleViewDetails = (id) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/product/${id}`); // Navigate to product detail page
    }, 1000); // Simulate loading delay
  };

  const handleOrderNow = (productId) => {
    // Buy now action, redirect to checkout with one product
    navigate(`/home/product/ordernow/${productId}`);
  };

  const handleViewNow = (productId) => {
    navigate(`/home/product/${productId}`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-semibold text-gray-800">Your Cart is Empty</h1>
        <p className="text-gray-600 mt-4">Add items to your cart to see them here!</p>
         <GiphyEmbed/> 
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Your Cart</h1>
      
      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center items-center mb-4">
          <ClipLoader color="#4A90E2" loading={loading} size={50} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-40 object-cover rounded-t-lg cursor-pointer" 
              onClick={() => handleViewDetails(item.id)} 
            />
            <div className="p-2">
              <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
              <p className="text-gray-600 mt-1">Price: Rs.{item.price}</p>
              <p className="text-gray-600 mt-1">Quantity: {item.quantity}</p>

              {/* Quantity Controls */}
              <div className="flex mt-2">
                <button 
                  onClick={() => handleDecrease(item.id, item.quantity)} 
                  className="bg-red-800 text-white px-3 py-1 rounded-lg hover:bg-red-900 transition-all"
                  disabled={item.quantity === 1}
                >
                  -
                </button>
                <button 
                  onClick={() => handleIncrease(item.id)} 
                  className="bg-green-800 text-white px-3 py-1 rounded-lg ml-2 hover:bg-green-900 transition-all"
                >+</button>
              </div>

              {/* Remove and Buy Now Buttons */}
              <div className="mt-4 flex justify-between">
                <button 
                  onClick={() => handleRemove(item.id)} 
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Remove
                </button>
                <button 
                  onClick={() => handleOrderNow(item.id)} 
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                >
                  Order Now
                </button>
                <button 
                  onClick={() => handleViewNow(item.id)} 
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Price and Checkout Button */}
      <div className="mt-8 p-4 bg-gray-200 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700">Total Price: Rs.{calculateTotal()}</h2>
        <button 
          className="mt-4 bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-900 transition-all"
          onClick={() => navigate('/checkout')} // Proceed to checkout for all items
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
