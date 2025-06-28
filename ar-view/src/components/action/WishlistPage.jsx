import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromWishlist,
  clearWishlist,
} from "../../assets/reducx/slices/wishlistSlice";
import { addToCart } from "../../assets/reducx/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import GiphyEmbed from "../../assets/css/loader";
const WishlistPage = () => {
  const wishlistItems = useSelector((state) => state.wishlist.items); // Get wishlist items from Redux store
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Calculate the total price of the wishlist
  const totalPrice = wishlistItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Remove a specific item from the wishlist
  const handleRemoveFromWishlist = (id) => {
    dispatch(removeFromWishlist(id));
    alertCentered("Item removed from wishlist!");
  };

  // Add a specific item to the cart and remove it from the wishlist
  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
    dispatch(removeFromWishlist(item.id));
    alertCentered(`${item.name} added to cart!`);
  };

  // Clear the entire wishlist
  const handleClearWishlist = () => {
    dispatch(clearWishlist());
    alertCentered("Wishlist cleared!");
  };

  // Move all wishlist items to the cart
  const handleMoveAllToCart = () => {
    wishlistItems.forEach((item) => {
      dispatch(addToCart(item));
      dispatch(removeFromWishlist(item.id));
    });
    alertCentered("All items moved to cart!");
  };

  // Share wishlist functionality
  const handleShareWishlist = () => {
    const wishlistUrl = `${window.location.origin}/wishlist`; // Generate wishlist URL
    navigator.clipboard.writeText(wishlistUrl);
    alertCentered("Wishlist URL copied to clipboard!");
  };

  // Save an item for later functionality
  const handleSaveForLater = (item) => {
    alertCentered(`${item.name} saved for later!`);
  };

  // Adjust the quantity of an item in the wishlist
  const handleQuantityChange = (id, quantity) => {
    const updatedItems = wishlistItems.map((item) =>
      item.id === id ? { ...item, quantity: parseInt(quantity) } : item
    );
    dispatch({ type: "wishlist/updateQuantity", payload: updatedItems }); // Add your slice action for quantity update
  };

  // Alert box
  const alertCentered = (message) => {
    const alertBox = document.createElement("div");
    alertBox.className =
      "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white p-4 rounded-lg z-50";
    alertBox.textContent = message;
    document.body.appendChild(alertBox);

    setTimeout(() => {
      document.body.removeChild(alertBox);
    }, 2000);
  };

  // Navigate to product detail page
  const handleViewDetails = (id) => {
    navigate(`/product/${id}`);
  };

  // If the wishlist is empty
  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-semibold text-gray-800">
          Your Wishlist is Empty
        </h1>
        <p className="text-gray-600 mt-4">
          Add items to your wishlist to see them here!
        </p>
        <GiphyEmbed />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">
        Your Wishlist
      </h1>

      {/* Display the total price */}
      <div className="text-lg font-semibold text-gray-700 mb-4">
        Total Wishlist Price: ${totalPrice.toFixed(2)}
      </div>

      {/* Total number of items */}
      <div className="text-lg font-semibold text-gray-700 mb-4">
        Total Items in Wishlist: {wishlistItems.length}
      </div>

      {/* Clear Wishlist Button */}
      <button
        onClick={handleClearWishlist}
        className="bg-red-800 text-white px-4 py-2 rounded-lg mb-4 hover:bg-red-900 transition-all"
      >
        Clear Wishlist
      </button>

      {/* Move All to Cart Button */}
      <button
        onClick={handleMoveAllToCart}
        className="bg-blue-800 text-white ml-4 px-4 py-2 rounded-lg mb-4 hover:bg-blue-900 transition-all"
      >
        Move All to Cart
      </button>

      {/* Share Wishlist Button */}
      <button
        onClick={handleShareWishlist}
        className="bg-gray-800 text-white ml-4 px-4 py-2 rounded-lg mb-4 hover:bg-green-900 transition-all"
      >
        Share Wishlist
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 object-cover rounded-t-lg cursor-pointer"
              onClick={() => handleViewDetails(item.id)}
            />
            <div className="p-2">
              <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
              <p className="text-gray-600 mt-1">Price: Rs.{item.price}</p>

              {/* Quantity Selector */}
              <div className="mt-2">
                <label htmlFor="quantity" className="text-gray-600">
                  Quantity:
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, e.target.value)
                  }
                  className="ml-2 p-1 w-16 text-center border rounded"
                />
              </div>

              {/* Remove, Add to Cart, and Save for Later Buttons */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-all"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleSaveForLater(item)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                >
                  Save for Later
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
