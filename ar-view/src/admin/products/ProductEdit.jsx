import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/product/${id}`);
        setProduct(data.product || data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/product/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setShowDeleteModal(false);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Failed to delete product. Please check your permissions.");
    }
  };

  const handleImageClick = (index) => {
    setActiveImage(index);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 right-0 bottom-0 animate-ping rounded-full bg-blue-400 opacity-75"></div>
          <div className="absolute top-2 left-2 right-2 bottom-2 animate-pulse rounded-full bg-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
            <svg className="w-10 h-10 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Product
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <div className="md:flex">
            {/* Left Column - Images + 3D */}
            <div className="md:w-1/2 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Main Image with fadeIn effect */}
              <div className="relative rounded-xl overflow-hidden bg-white shadow-md h-80 group">
                <img
                  src={product.images?.[activeImage]?.url || "/placeholder.jpg"}
                  alt={product.productName}
                  className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              </div>

              {/* Gallery Navigation */}
              {product.images?.length > 1 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Gallery
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                    {product.images.map((img, index) => (
                      <div
                        key={index}
                        onClick={() => handleImageClick(index)}
                        className={`snap-start cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          activeImage === index
                            ? "border-blue-500 shadow-md scale-105"
                            : "border-transparent hover:border-blue-300"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`Image ${index + 1}`}
                          className="w-20 h-20 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3D Model Viewer */}
              {product.modelFile?.url && (
                <div className="mt-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    3D Model
                  </h3>
                  <model-viewer
                    src={product.modelFile.url}
                    alt="3D Model"
                    auto-rotate
                    camera-controls
                    ar
                    shadow-intensity="1"
                    style={{
                      width: "100%",
                      height: "300px",
                      borderRadius: "12px",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Product Details */}
            <div className="md:w-1/2 p-8 bg-white">
              <div className="space-y-6">
                <div>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
                    {product.category}
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
                    {product.productName}
                  </h1>
                </div>

                <div className="flex items-center space-x-4">
                  {product.discountedPrice ? (
                    <>
                      <div className="text-3xl font-bold text-indigo-600">
                        ${product.discountedPrice}
                      </div>
                      <div className="text-xl text-gray-500 line-through">
                        ${product.price}
                      </div>
                      <div className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium">
                        Save Rs
                        {(product.price - product.discountedPrice).toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-indigo-600">
                      ${product.price}
                    </div>
                  )}
                </div>

                <div className="prose prose-blue max-w-none">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Description
                  </h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm text-gray-500">Stock</span>
                    <div className="text-lg font-medium text-gray-800 flex items-center">
                      <span
                        className={`h-3 w-3 rounded-full mr-2 ${
                          product.stock > 10
                            ? "bg-green-500"
                            : product.stock > 0
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      {product.stock} {product.stock === 1 ? "unit" : "units"}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm text-gray-500">Dimensions</span>
                    <div className="text-lg font-medium text-gray-800">
                      {product.dimensions || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 bg-white text-red-600 border border-red-200 rounded-lg font-medium flex-1 hover:bg-red-50 transition-all hover:border-red-300 transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-fade-in-up">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Delete Product
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{product.productName}"? This
                action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-5 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-5 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductEdit;
