import React, { useRef, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

export default function CatSlider() {
  const sliderRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories and random products from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get all products
        const productsResponse = await axios.get(`/api/products`);

        if (productsResponse.data.success) {
          const products = productsResponse.data.products || [];

          // Extract unique categories from products
          const uniqueCategories = Array.from(
            new Set(products.map((product) => product.category))
          ).map((category) => {
            // Find a product with this category to use as a representative
            const representativeProduct = products.find(
              (p) => p.category === category
            );
            return {
              category,
              image: representativeProduct?.images?.[0]?.url || "",
              productId: representativeProduct?._id,
            };
          });

          setCategories(uniqueCategories);

          // Shuffle products and select random ones for cards
          const shuffledProducts = [...products].sort(
            () => Math.random() - 0.5
          );
          setRandomProducts(shuffledProducts.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to load categories and products. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <p>Loading categories and products...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 my-8 mx-10">{error}</div>;
  }

  return (
    <>
      {/* Category Slider Section */}
      <div className="relative overflow-hidden mx-4 sm:mx-10 py-8">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/3 transform -translate-y-1/2 bg-white hover:bg-blue-100 p-2 rounded-full shadow-md z-10"
        >
          <FaChevronLeft className="h-6 w-6 text-gray-800" />
        </button>

        {/* Category Slider */}
        <div
          ref={sliderRef}
          className="flex space-x-4 sm:space-x-6 py-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        >
          {categories.map((categoryItem, index) => (
            <Link to={`/home/product/${categoryItem.productId}`} key={index}>
              <div className="w-40 sm:w-48 h-56 sm:h-64 bg-white rounded-lg shadow-lg snap-start flex-shrink-0 transform transition-transform duration-300 hover:scale-105">
                <img
                  src={categoryItem.image}
                  alt={categoryItem.category}
                  className="w-full h-2/3 object-cover rounded-t-lg"
                />
                <div className="p-4 text-center">
                  <h3 className="text-sm font-semibold text-gray-800">
                    <b>{categoryItem.category}</b>
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Browse Collection
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/3 transform -translate-y-1/2 bg-white hover:bg-blue-100 p-2 rounded-full shadow-md z-10"
        >
          <FaChevronRight className="h-6 w-6 text-gray-800" />
        </button>
      </div>

      {/* Random Cards Section */}
      <div className="container mx-auto py-8 px-4 sm:px-16">
        <h1 className="mb-4 text-2xl sm:text-3xl font-extrabold leading-none tracking-tight text-blue-400">
          FIND OUT
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {randomProducts.map((product) => (
            <div
              key={product._id}
              className="group relative bg-gray-100 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {/* Product Image */}
              <img
                src={
                  product.images && product.images.length > 0
                    ? product.images[0].url
                    : ""
                }
                alt={product.productName}
                className="w-full h-48 sm:h-60 object-cover"
              />

              {/* Animated Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-300 via-blue-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Hover Content */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <Link
                  to={`/home/product/${product._id}`}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div className="text-center p-4">
                    <h2 className="text-gray-900 text-sm sm:text-lg font-bold">
                      {product.productName}
                    </h2>
                    <p className="text-gray-900 text-xs sm:text-sm mt-2">
                      {product.description?.substring(0, 60) + "..." ||
                        "Discover our exclusive products."}
                    </p>
                    <p className="text-gray-900 font-bold mt-2">
                      Rs. {product.discountedPrice || product.price}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
