import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../assets/reducx/slices/authSlice";
import axios from "axios";
import {
  FaLeaf,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaSpinner,
  FaClipboardList,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchError, setSearchError] = useState("");

  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user info from Redux store
  const { userId, token, role } = useSelector((state) => state.auth);

  // Toggle theme
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      dispatch(logout());
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  // Handle search input change and fetch results
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      searchProducts(value);
    } else {
      setSearchResults([]);
      setSearchError("");
    }
  };

  // Fetch seller orders count for notification badge
  const fetchOrdersCount = async () => {
    try {
      const response = await axios.get(`/api/orders/seller`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Set the count based on the number of orders returned
      if (response.data && Array.isArray(response.data)) {
        // Filter for only pending or processing orders to show as notifications
        const newOrders = response.data.filter(
          (order) => order.status === "Pending" || order.status === "Processing"
        );
        setOrdersCount(newOrders.length);
      }
    } catch (error) {
      console.error("Error fetching orders count:", error);
    }
  };

  // Fetch orders count on component mount and every 5 minutes
  useEffect(() => {
    // Initial fetch
    fetchOrdersCount();

    // Set up interval to check for new orders every 5 minutes
    const interval = setInterval(fetchOrdersCount, 300000);

    return () => clearInterval(interval);
  }, [token]);

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        searchProducts(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Search products API call
  const searchProducts = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchError("");

    try {
      const response = await axios.get(`/api/products/search`, {
        params: {
          query,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSearchResults(response.data.products || []);

      if (response.data.products?.length === 0) {
        setSearchError("No matching products found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to fetch search results");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Navigate to product details when clicked
  const handleProductClick = (productId) => {
    navigate(`/admin/product/${productId}`);
    setSearchTerm("");
    setSearchResults([]);
    setSearchFocused(false);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(searchTerm)}`);
      setSearchResults([]);
    }
  };

  // Navigate to orders page when order icon is clicked
  const handleOrdersClick = () => {
    navigate("/admin/order");
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        resultsRef.current &&
        !searchRef.current.contains(event.target) &&
        !resultsRef.current.contains(event.target)
      ) {
        setSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sticky header on scroll
  useEffect(() => {
    const header = document.getElementById("admin-header");
    if (!header) return;

    const sticky = header.offsetTop;

    const handleScroll = () => {
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Format price with commas and decimal places
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <header
      id="admin-header"
      className="w-full bg-white dark:bg-gray-800 shadow-md fixed top-0 z-50 transition-all"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <FaLeaf className="text-green-500 text-2xl mr-2" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Decor Dream
          </span>
        </div>

        {/* Search */}
        <div className="relative w-1/2 md:w-1/3" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
            <div className="absolute left-3 top-2.5 text-gray-400 text-lg">
              {isSearching ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FiSearch />
              )}
            </div>
          </form>

          {/* Search Results Dropdown */}
          {searchFocused && (searchResults.length > 0 || searchError) && (
            <div
              ref={resultsRef}
              className="absolute bg-white dark:bg-gray-700 border dark:border-gray-600 mt-1 rounded-md shadow-lg w-full z-10 max-h-96 overflow-y-auto"
            >
              {searchError ? (
                <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                  {searchError}
                </div>
              ) : (
                searchResults.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 flex items-center"
                  >
                    {/* Product Image Thumbnail */}
                    <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-800 flex-shrink-0 mr-3 overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images?.[0]?.url || "/placeholder.jpg"}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FaLeaf />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <div className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                        {product.productName}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {product.category}
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* View All Results Link */}
              {searchResults.length > 0 && (
                <div
                  className="px-4 py-2 text-center text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/search-results?query=${encodeURIComponent(searchTerm)}`
                    )
                  }
                >
                  View all results
                </div>
              )}
            </div>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-8">
          {/* Orders Icon - Main notification feature for sellers */}
          <div
            className="relative"
            onClick={handleOrdersClick}
            title="Seller Orders"
          >
            <FaClipboardList className="text-xl cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
            {ordersCount > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1 min-w-[18px] h-[18px] flex items-center justify-center">
                {ordersCount > 99 ? "99+" : ordersCount}
              </span>
            )}
          </div>

          {/* Dark Mode Toggle */}

          {/* Account Dropdown */}
          <div className="relative group">
            <FaUser className="text-xl  cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
            <div className="absolute top-5 right-0 w-48 bg-white dark:bg-gray-700 shadow-md rounded-md hidden group-hover:block z-10">
              <ul className="py-2">
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                  <Link
                    to="/admin/analytics"
                    className="block w-full text-gray-800 dark:text-gray-200"
                  >
                    Analytics
                  </Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                  <Link
                    to="/admin/settings"
                    className="block w-full text-gray-800 dark:text-gray-200"
                  >
                    Settings
                  </Link>
                </li>
                <li className="border-t border-gray-100 dark:border-gray-600 mt-2 pt-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-gray-800 dark:text-gray-200"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-xl md:hidden text-gray-600 dark:text-gray-300"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 py-2 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <div
            className="block py-2 text-gray-800 dark:text-gray-200 cursor-pointer"
            onClick={handleOrdersClick}
          >
            Orders{" "}
            {ordersCount > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                {ordersCount}
              </span>
            )}
          </div>

          <Link
            to="/admin/profile"
            className="block py-2 text-gray-800 dark:text-gray-200"
          >
            Profile
          </Link>

          <Link
            to="/admin/settings"
            className="block py-2 text-gray-800 dark:text-gray-200"
          >
            Settings
          </Link>

          <button
            onClick={handleLogout}
            className="block py-2 text-gray-800 dark:text-gray-200 text-left w-full"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
