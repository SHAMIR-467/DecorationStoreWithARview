import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaCartPlus,
  FaStar,
  FaShoppingCart,
  FaStarHalfAlt,
  FaRegStar,
  FaHeart,
  FaChevronRight,
  FaChevronLeft,
  FaExchangeAlt,
  FaChevronUp,
  FaFilter,
  FaThLarge,
  FaTh,
  FaThList,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../assets/reducx/slices/cartSlice";
import { addToWishlist } from "../../assets/reducx/slices/wishlistSlice";
import { addToCompare } from "../../assets/reducx/slices/compareSlice";
import { toast } from "react-toastify";
import axios from "axios";

const ProductListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItemsCount = useSelector((state) => state.cart.length);
  const wishlistItemsCount = useSelector((state) => state.wishlist.length);
  const compareItemsCount = useSelector((state) => state.compare.length);

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(5000);
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [gridView, setGridView] = useState("grid-4");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [categories, setCategories] = useState(["All"]);

  // Changed from 20 to 12 as per your requirement
  const productsPerPage = 12;
  const brands = ["Brand A", "Brand B", "Brand C", "Brand D"];
  const colors = ["Red", "Blue", "Green", "Black", "White"];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products`);
        if (response.data.success) {
          // Transform the data to match your component's expected format
          const transformedProducts = response.data.products.map((product) => ({
            id: product._id,
            name: product.productName,
            description: product.description,
            category: product.category,
            price: product.price,
            discountedPrice: product.discountedPrice,
            image:
              product.images && product.images.length > 0
                ? product.images[0].url
                : "",
            images: product.images || [],
            stock: product.stock,
            dimensions: product.dimensions,
            rating: product.rating || 4, // Default rating if not provided
            label: product.stock < 10 ? "Low Stock" : null, // Example of custom label based on stock
          }));
          setProducts(transformedProducts);
          console.log(`Loaded ${transformedProducts.length} products from API`);

          // Extract unique categories
          const uniqueCategories = [
            "All",
            ...new Set(transformedProducts.map((p) => p.category)),
          ];
          setCategories(uniqueCategories);
        } else {
          setError("Failed to load products: API reported failure");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const getFilteredProducts = () => {
    if (!products.length) return [];

    let filtered = [...products];

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter((p) => p.discountedPrice <= priceRange);

    // Brand filter
    if (selectedBrands.length) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    }

    // Color filter
    if (selectedColors.length) {
      filtered = filtered.filter((p) => selectedColors.includes(p.color));
    }

    // Rating filter
    if (selectedRating > 0) {
      filtered = filtered.filter((p) => p.rating >= selectedRating);
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case "price-high":
        filtered.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Calculate total pages before slicing products
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Make sure currentPage is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredProducts.length, totalPages, currentPage]);

  // Get the current page's products
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Handlers
  const handleGridChange = (grid) => {
    setGridView(grid);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleColorChange = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setPriceRange(5000);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedRating(0);
    setSortBy("featured");
    setCurrentPage(1);
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
    alertCentered(`${product.name} added to Cart!`);
  };

  const handleAddToWishlist = (product) => {
    dispatch(addToWishlist(product));
    toast.success(`${product.name} added to wishlist!`);
    alertCentered(`${product.name} added to wishlist!`);
  };

  const handleAddToCompare = (product) => {
    dispatch(addToCompare(product));
    toast.success(`${product.name} added to compare!`);
    alertCentered(`${product.name} added to compare!`);
  };

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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error!</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div
          className={`w-full lg:w-64 flex-shrink-0 transition-all duration-300 ${
            showFilters ? "translate-x-0" : "-translate-x-full lg:hidden"
          }`}
        >
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Filters</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset All
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Categories</h4>
              {categories.map((category) => (
                <div key={category} className="mb-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                      className="form-radio text-blue-600"
                    />
                    <span>{category}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Price Range</h4>
              <input
                type="range"
                min="0"
                max="5000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>RS:0</span>
                <span>RS:{priceRange}</span>
              </div>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Brands</h4>
              {brands.map((brand) => (
                <div key={brand} className="mb-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="form-checkbox text-blue-600"
                    />
                    <span>{brand}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Colors */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Colors</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      selectedColors.includes(color)
                        ? "border-blue-600"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Rating</h4>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="mb-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === rating}
                      onChange={() => setSelectedRating(rating)}
                      className="form-radio text-blue-600"
                    />
                    <div className="flex items-center">
                      {[...Array(rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 w-4 h-4" />
                      ))}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <FaFilter className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleGridChange("grid-4")}
                    className={`p-2 rounded-lg ${
                      gridView === "grid-4"
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <FaThLarge />
                  </button>
                  <button
                    onClick={() => handleGridChange("grid-3")}
                    className={`p-2 rounded-lg ${
                      gridView === "grid-3"
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <FaTh />
                  </button>
                  <button
                    onClick={() => handleGridChange("list")}
                    className={`p-2 rounded-lg ${
                      gridView === "list"
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <FaThList />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-x-4">
                <span className="text-gray-600">
                  Showing{" "}
                  {filteredProducts.length > 0
                    ? (currentPage - 1) * productsPerPage + 1
                    : 0}
                  -
                  {Math.min(
                    currentPage * productsPerPage,
                    filteredProducts.length
                  )}{" "}
                  of {filteredProducts.length}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Debug info - helpful for diagnosing issues */}
          <div className="mb-4 p-2 bg-gray-100 rounded">
            <p className="text-xs text-gray-600">
              Total products: {products.length} | Filtered products:{" "}
              {filteredProducts.length} | Products per page: {productsPerPage} |
              Current page: {currentPage} of {totalPages} | Products on this
              page: {currentProducts.length}
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">
                No products found matching your criteria.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                gridView === "grid-4"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  : gridView === "grid-3"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onClick={() => navigate(`/home/product/${product.id}`)}
                    />
                    {product.label && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        {product.label}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-semibold text-lg mb-2 cursor-pointer"
                      onClick={() => navigate(`/home/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    <p
                      className="text-gray-600 text-sm mb-2 line-clamp-2 cursor-pointer"
                      onClick={() => navigate(`/home/product/${product.id}`)}
                    >
                      {product.description}
                    </p>
                    <div
                      className="flex items-center justify-between mb-2"
                      onClick={() => navigate(`/home/product/${product.id}`)}
                    >
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          ({product.rating})
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        {product.price !== product.discountedPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            Rs.{product.price}
                          </span>
                        )}
                        <span className="text-sm font-bold text-blue-600">
                          Rs.{product.discountedPrice}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={product.stock <= 0}
                      >
                        <FaShoppingCart />
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <FaHeart className="w-5 h-5 text-red-500" />
                        </button>
                        <button
                          onClick={() => handleAddToCompare(product)}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <FaExchangeAlt className="w-5 h-5 text-green-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300"
                >
                  <FaChevronLeft />
                </button>

                {/* Show pagination numbers with ellipsis for many pages */}
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;

                  // Always show first page, last page, current page, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }

                  // Show ellipsis instead of all page numbers
                  if (
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 &&
                      currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={pageNumber} className="px-2 py-2">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
