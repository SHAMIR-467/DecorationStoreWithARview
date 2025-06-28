import React from "react";
import {
  FaTruck,
  FaSyncAlt,
  FaExclamationTriangle,
  FaMobileAlt,
  FaStore,
  FaShippingFast,
  FaRegSmile,
  FaCommentDots,
} from "react-icons/fa";

const ProductDetailInfo = () => {
  return (
    <div className="p-6  bg-blue-100 shadow-lg rounded-lg">
      {/* Delivery Info Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Delivery Options</h3>
          <p className="text-gray-700">Location:</p>
        </div>
        <FaTruck className="text-2xl text-blue-500 animate-pulse" />
      </div>

      <div className="mb-4">
        <p className="text-gray-800">
          Standard Delivery: <span className="font-bold">Rs. 250</span>
        </p>
        <p className="text-gray-600">Guaranteed within 7 days</p>
        <p className="text-gray-600">Cash on Delivery Available</p>
      </div>

      {/* Return & Warranty Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Return & Warranty</h3>
        <FaSyncAlt className="text-2xl text-green-500 animate-spin" />
      </div>
      <p className="text-gray-600">14 days easy return</p>
      <p className="text-red-500">Warranty not available</p>

      {/* Seller Info */}
      <div className="mt-8 bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-lg font-semibold">Sold By</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold"></p>
            <p className="text-gray-600">Positive Seller Ratings: 81%</p>
          </div>
          <FaStore className="text-2xl text-blue-600" />
        </div>
        <div className="mt-2">
          <p className="text-gray-600">Ship on Time: 100%</p>
          <p className="text-gray-600">Chat Response Rate: Not enough data</p>
        </div>
      </div>

      {/* Chat with Seller */}
      <div className="mt-4 text-center"></div>
    </div>
  );
};

export default ProductDetailInfo;
