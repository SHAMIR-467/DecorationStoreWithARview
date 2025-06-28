import React, { useState, useEffect } from "react";
import { AiFillStar } from "react-icons/ai";
import { Link } from "react-router-dom";
import axios from "axios";

// ProductSection component to display a category of products
const ProductSection = ({ title, products, isLoading }) => (
  <div className="w-full md:w-1/2 lg:w-1/4 p-4">
    <h3 className="text-xl font-semibold mb-4 text-center bg-gray-100 rounded-lg p-2 text-blue-400">
      {title}
    </h3>
    <div className="space-y-4">
      {isLoading ? (
        // Display skeleton loaders while loading
        [...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex items-center bg-white rounded-lg shadow-md mb-4 p-4"
          >
            <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="ml-4 w-full">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))
      ) : products.length > 0 ? (
        // Display actual products
        products.map((product) => (
          <Link to={`/home/product/${product._id}`} key={product._id}>
            <div className="flex items-center bg-white rounded-lg shadow-md mb-4 p-4 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl">
              <img
                src={
                  product.images && product.images.length > 0
                    ? product.images[0].url
                    : "/placeholder-image.jpg"
                }
                alt={product.productName}
                className="w-20 h-20 object-cover rounded-lg transition duration-300 hover:scale-110"
              />
              <div className="ml-4">
                <h4 className="text-gray-900 font-semibold">
                  {product.productName}
                </h4>
                <div className="flex items-center text-yellow-500">
                  <AiFillStar />
                  <span className="ml-1">{product.rating}</span>
                </div>
                <p className="text-blue-600 font-semibold">
                  Rs.{product.discountedPrice || product.price}
                  {product.discountedPrice &&
                    product.discountedPrice < product.price && (
                      <span className="text-gray-500 text-sm line-through ml-2">
                        Rs.{product.price}
                      </span>
                    )}
                </p>
              </div>
            </div>
          </Link>
        ))
      ) : (
        // Display message when no products are available
        <div className="text-center text-gray-500 py-4">
          No products available
        </div>
      )}
    </div>
  </div>
);

const TopProduct = () => {
  // Host URL for API

  // State for different product categories
  const [productData, setProductData] = useState({
    topSelling: [],
    trendingProducts: [],
    recentlyAdded: [],
    topRated: [],
  });

  // Loading states
  const [loading, setLoading] = useState({
    topSelling: true,
    trendingProducts: true,
    recentlyAdded: true,
    topRated: true,
  });

  // Error states
  const [errors, setErrors] = useState({
    topSelling: null,
    trendingProducts: null,
    recentlyAdded: null,
    topRated: null,
  });

  // Function to fetch products with parameters
  const fetchProducts = async (endpoint, params, category) => {
    try {
      setLoading((prev) => ({ ...prev, [category]: true }));
      const response = await axios.get(`/api${endpoint}`, { params });

      if (response.data.success) {
        // Get products from response (adjust based on your API response structure)
        const products = response.data.products || response.data.product || [];

        // Update state with fetched products
        setProductData((prev) => ({
          ...prev,
          [category]: Array.isArray(products) ? products.slice(0, 3) : [],
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [category]: "Failed to fetch products",
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      setErrors((prev) => ({
        ...prev,
        [category]:
          error.message || "An error occurred while fetching products",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [category]: false }));
    }
  };

  useEffect(() => {
    // Fetch all product categories
    // Modify these API calls based on your actual backend endpoints

    // Top Selling products - Example: sort by sales count
    fetchProducts("/products", { sort: "-salesCount", limit: 3 }, "topSelling");

    // Trending products - Example: sort by views
    fetchProducts(
      "/products",
      { sort: "-views", limit: 3 },
      "trendingProducts"
    );

    // Recently added products - sort by creation date
    fetchProducts(
      "/products",
      { sort: "-createdAt", limit: 3 },
      "recentlyAdded"
    );

    // Top rated products - sort by rating
    fetchProducts("/products", { sort: "-rating", limit: 3 }, "topRated");
  }, []);

  // Function to shuffle an array (for random product display)
  const shuffleArray = (array) => {
    // Create a copy of the array to avoid mutating the original
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // If you want to shuffle products in a specific category
  const getRandomProducts = (category) => {
    return shuffleArray(productData[category]);
  };

  return (
    <div className="bg-white py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold ml-10 text-black-900 rounded">
          Top Decoration Products
        </h2>
        <div className="flex flex-wrap justify-between">
          <ProductSection
            title="Top Selling"
            products={productData.topSelling}
            isLoading={loading.topSelling}
          />
          <ProductSection
            title="Trending Products"
            products={productData.trendingProducts}
            isLoading={loading.trendingProducts}
          />
          <ProductSection
            title="Recently Added"
            products={productData.recentlyAdded}
            isLoading={loading.recentlyAdded}
          />
          <ProductSection
            title="Top Rated"
            products={productData.topRated}
            isLoading={loading.topRated}
          />
        </div>
      </div>
    </div>
  );
};

export default TopProduct;
