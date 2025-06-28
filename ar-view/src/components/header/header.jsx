// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiHeart,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { MdMap } from "react-icons/md";
import { FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import Logo from "../../assets/images/3Dlogo.png";

import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../assets/reducx/slices/cartSlice";
import { addToCompare } from "../../assets/reducx/slices/compareSlice";
import { addToWishlist } from "../../assets/reducx/slices/wishlistSlice";
import { logout } from "../../assets/reducx/slices/authSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // redux counts
  const compareCount = useSelector((s) => s.compare.items.length);
  const favoriteCount = useSelector((s) => s.wishlist.items.length);
  const cartCount = useSelector((s) => s.cart.items.length);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // search/category state
  const [category, setCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const debounceRef = useRef(null);

  // handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/auth/login");
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };

  // fetch suggestions on category or searchTerm change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const params = { query: searchTerm };
        if (category) params.category = category;
        const { data } = await axios.get(`/api/products/search`, {
          params,
        });
        setSuggestions(data.products || data); // adapt to your response shape
      } catch (err) {
        console.error("Search error", err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, category]);

  // click suggestion
  const onSuggestionClick = (prod) => {
    setSearchTerm("");
    setSuggestions([]);
    navigate(`/home/product/${prod._id}`);
  };

  return (
    <header className="bg-gray-800 text-white sticky top-0 z-[9999]">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo and Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>

          <Link to="/" className="flex items-center">
            <img src={Logo} alt="Decor Dreams" className="h-10 w-10 mr-2" />
            <span className="text-xl font-bold hidden md:inline">
              Decor Dreams
            </span>
          </Link>
        </div>

        {/* Search Bar - Hidden on Mobile */}
        <div className="relative flex-1 mx-8 hidden md:block">
          <div className="flex">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-l bg-white text-black p-2"
            >
              <option value="">All Categories</option>
              <option>Electronic</option>
              <option>Sports</option>
              <option>Stationary</option>
              <option>Clothing</option>
              <option>Hand Made</option>
              <option>Accessories</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Crafting</option>
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="flex-1 p-2 border-t border-b border-white text-black focus:outline-none"
              onFocus={() => setOpen(true)}
            />
            <button
              onClick={() => setOpen(false)}
              className="bg-blue-500 p-2 rounded-r hover:bg-blue-600"
            >
              <FiSearch className="text-white" />
            </button>
          </div>

          {/* suggestions dropdown */}
          {open && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white text-black mt-1 rounded-b shadow-lg max-h-60 overflow-auto z-50">
              {suggestions.map((prod) => (
                <li
                  key={prod._id}
                  onClick={() => onSuggestionClick(prod)}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
                >
                  {prod.images?.[0]?.url && (
                    <img
                      src={prod.images[0].url}
                      alt={prod.productName}
                      className="w-8 h-8 object-cover rounded mr-2"
                    />
                  )}
                  <div className="flex-1">
                    <div className="truncate">
                      {prod.productName || prod.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      ${prod.discountedPrice || prod.price}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <Link to="/compare" className="relative hidden md:block">
            <MdMap className="h-6 w-6" />
            {compareCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-xs rounded-full px-1">
                {compareCount}
              </span>
            )}
          </Link>
          <Link to="/wishlist" className="relative hidden md:block">
            <FiHeart className="h-6 w-6" />
            {favoriteCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-xs rounded-full px-1">
                {favoriteCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative">
            <FiShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-xs rounded-full px-1">
                {cartCount}
              </span>
            )}
          </Link>
          <div
            className="relative group"
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className="p-2 hover:bg-gray-900 rounded-full transition-colors"
              onMouseEnter={() => setDropdownOpen(true)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <FiUser className="h-6 w-6" />
            </button>

            <div
              className={`absolute right-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 origin-top-right
    ${
      dropdownOpen
        ? "opacity-100 scale-100"
        : "opacity-0 scale-95 pointer-events-none"
    }`}
            >
              <div className="py-1">
                <Link
                  to="/account"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  My Account
                </Link>
                <Link
                  to="/order-tracking"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Order Tracking
                </Link>
                <Link
                  to="/orders"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search and Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-800 p-4 shadow-lg">
          {/* Mobile Search */}
          <div className="mb-4">
            <div className="flex">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-l bg-white text-black p-2 w-1/3"
              >
                <option value="">All</option>
                <option>Electronic</option>
                <option>Sports</option>
                <option>Stationary</option>
                <option>Clothing</option>
                <option>Hand Made</option>
                <option>Accessories</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Crafting</option>
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="flex-1 p-2 border-t border-b border-white text-black focus:outline-none"
                onFocus={() => setOpen(true)}
              />
              <button
                onClick={() => setOpen(false)}
                className="bg-blue-500 p-2 rounded-r hover:bg-blue-600"
              >
                <FiSearch className="text-white" />
              </button>
            </div>

            {/* Mobile Suggestions */}
            {open && suggestions.length > 0 && (
              <ul className="bg-white text-black mt-1 rounded-b shadow-lg max-h-60 overflow-auto z-50">
                {suggestions.map((prod) => (
                  <li
                    key={prod._id}
                    onClick={() => onSuggestionClick(prod)}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
                  >
                    {prod.images?.[0]?.url && (
                      <img
                        src={prod.images[0].url}
                        alt={prod.productName}
                        className="w-8 h-8 object-cover rounded mr-2"
                      />
                    )}
                    <div className="flex-1">
                      <div className="truncate">
                        {prod.productName || prod.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        ${prod.discountedPrice || prod.price}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mobile Menu Items */}
          <div className="space-y-2">
            <Link
              to="/compare"
              className="flex items-center space-x-2 text-white hover:bg-gray-700 p-2 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MdMap className="h-6 w-6" />
              <span>Compare</span>
              {compareCount > 0 && (
                <span className="bg-green-500 text-xs rounded-full px-1 ml-2">
                  {compareCount}
                </span>
              )}
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center space-x-2 text-white hover:bg-gray-700 p-2 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiHeart className="h-6 w-6" />
              <span>Wishlist</span>
              {favoriteCount > 0 && (
                <span className="bg-green-500 text-xs rounded-full px-1 ml-2">
                  {favoriteCount}
                </span>
              )}
            </Link>
            <Link
              to="/account"
              className="flex items-center space-x-2 text-white hover:bg-gray-700 p-2 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiUser className="h-6 w-6" />
              <span>My Account</span>
            </Link>
            <Link
              to="/order-tracking"
              className="flex items-center space-x-2 text-white hover:bg-gray-700 p-2 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaClipboardList className="h-6 w-6" />
              <span>Order Tracking</span>
            </Link>
            <Link
              to="/orders"
              className="flex items-center space-x-2 text-white hover:bg-gray-700 p-2 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaClipboardList className="h-6 w-6" />
              <span>My Orders</span>
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left flex items-center space-x-2 text-white hover:bg-gray-700 p-2 rounded"
            >
              <FaSignOutAlt className="h-6 w-6" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
