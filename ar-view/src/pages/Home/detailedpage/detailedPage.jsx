import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCamera,
  FaJediOrder,
  FaCartPlus,
  FaHeart,
} from "react-icons/fa";
import ProductDetailTabs from "./tab";
import SimilarProducts from "./recommend";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../assets/reducx/slices/cartSlice";
import { addToWishlist } from "../../../assets/reducx/slices/wishlistSlice";
import { toast } from "react-toastify";
import ProductDetailInfo from "./productDetailInfo";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  // Fetch product data from backend
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Add a cache-busting parameter to avoid 304 responses
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/product/${id}?_t=${timestamp}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        if (response.data.success) {
          const productData = response.data.product;
          setProduct(productData);
          setPrice(productData.discountedPrice);
        } else {
          setError("Failed to fetch product data");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while fetching product data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]); // Removed 'host' as it was undefined

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center text-red-500 text-xl">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  // Get all product images
  const productImages = product.images?.map((img) => img.url) || [];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const openARView = () => {
    navigate(`/product/${id}/ar-view`);
  };

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    setPrice(newQuantity * product.discountedPrice);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      setPrice(newQuantity * product.discountedPrice);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const halfStar = (rating || 0) % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, index) => (
          <FaStar key={`full-${index}`} className="text-yellow-500" />
        ))}
        {halfStar && <FaStarHalfAlt className="text-yellow-500" />}
        {[...Array(emptyStars)].map((_, index) => (
          <FaRegStar key={`empty-${index}`} className="text-yellow-500" />
        ))}
      </div>
    );
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
  const handleCheckout = () => {
    navigate(`/checkoutpage/${id}`);
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.productName,
        price: product.price,
        discountedPrice: product.discountedPrice,
        image: productImages[0],
        quantity,
      })
    );
    toast.success(`${product.productName} added to cart!`);
    alertCentered(`${product.productName} added to Cart!`);
  };

  const handleAddToWishlist = () => {
    dispatch(
      addToWishlist({
        id: product._id,
        name: product.productName,
        price: product.price,
        discountedPrice: product.discountedPrice,
        image: productImages[0],
      })
    );
    toast.success(`${product.productName} added to wishlist!`);
    alertCentered(`${product.productName} added to wishlist!`);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row items-start justify-between">
        {/* Image Section */}
        <div className="md:w-1/3">
          {/* Main Image Container */}
          <div className="relative border-2 border-gray-600 rounded-xl shadow-lg overflow-hidden">
            {productImages.length > 0 ? (
              <img
                src={`${
                  productImages[currentImageIndex]
                }?_t=${new Date().getTime()}`} // Add cache-busting
                alt={product.productName}
                className="w-full h-auto object-cover transition-transform duration-500 ease-in-out transform hover:scale-110"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}

            {/* Navigation Arrows (only show if multiple images exist) */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                >
                  ←
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                >
                  →
                </button>
              </>
            )}

            {/* AR View Button (only show if model file exists) */}
            {product.modelFile?.url && (
              <div className="absolute bottom-4 left-4">
                <button
                  onClick={openARView}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300 flex items-center"
                >
                  <FaCamera className="mr-2" /> AR View
                </button>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex mt-4 space-x-2 overflow-x-auto">
              {productImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`cursor-pointer border-2 ${
                    currentImageIndex === index
                      ? "border-blue-500"
                      : "border-gray-300"
                  } rounded-lg overflow-hidden w-20 h-20`}
                >
                  <img
                    src={`${img}?_t=${new Date().getTime()}`} // Add cache-busting
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="md:w-1/3 md:pl-8 mt-6 md:mt-0">
          <h1 className="text-3xl font-bold text-brand-blue animate-pulse">
            {product.productName}
          </h1>
          <div className="mt-6">
            <span className="text-2xl border-2 border-blue-400 px-4 py-2 rounded-full hover:bg-blue-700 hover:text-white transition duration-300 font-bold text-blue-900">
              Rs. {product.discountedPrice.toFixed(2)}
            </span>
            {product.discountedPrice < product.price && (
              <span className="text-lg text-red-500 line-through ml-4">
                Rs. {product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center">
            {renderStars(product.rating)}
            <span className="ml-2   text-gray-600">{product.rating}</span>
          </div>

          <div className="mt-2 space-y-1">
            <p className="text-gray-800">
              <b>Category:</b> {product.category}
            </p>
            <p className="text-gray-800">
              <b>Stock:</b> {product.stock}
            </p>
            <p className="text-gray-800">
              <b>Size:</b> {product.dimensions}
            </p>
            <p className="text-gray-800"></p>
          </div>

          <div className="flex items-center border-2 border-gray-300 rounded-lg shadow-lg px-4 py-2 mt-2">
            <p className="mr-4">Select items</p>
            <button
              onClick={handleDecrement}
              className={`text-black bg-transparent border border-gray-300 rounded-lg px-5 py-2 mr-2 transition duration-300 hover:border-red-400 hover:bg-red-50 hover:text-red-500 ${
                quantity === 1 ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={quantity === 1}
            >
              <span className="font-bold text-lg">-</span>
            </button>
            <div className="text-xl font-bold text-gray-800 mx-4">
              {quantity}
            </div>
            <button
              onClick={handleIncrement}
              className="text-black bg-transparent border border-gray-300 rounded-lg px-4 py-2 transition duration-300 hover:border-green-400 hover:bg-green-50 hover:text-green-500"
            >
              <span className="font-bold text-lg">+</span>
            </button>
          </div>

          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleCheckout}
              className="border border-blue-900 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-700 hover:text-white transition duration-300 flex items-center"
            >
              <FaJediOrder className="mr-2" /> Order Now
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
            >
              <FaCartPlus className="mr-2" />
            </button>
            <button
              onClick={handleAddToWishlist}
              aria-label="add to wishlist"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 flex items-center"
            >
              <FaHeart className="mr-2" />
            </button>
          </div>
        </div>

        <div className="md:w-1/4 mt-6 md:mt-0">
          <ProductDetailInfo />
        </div>
      </div>

      <div className="border-2 rounded-2xl m-8">
        <ProductDetailTabs productData={product} />
      </div>
      <div className="bg-gray-50 rounded-3xl py-4 mx-8">
        <SimilarProducts
          currentCategory={product?.category}
          // Pass a timestamp to avoid caching issues for Recommend component
          timestamp={new Date().getTime()}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
