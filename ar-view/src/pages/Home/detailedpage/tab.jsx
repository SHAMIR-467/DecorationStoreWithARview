import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  MessageSquare,
  Star,
  Send,
  User,
  Info,
  FileText,
  Store,
  Loader2,
  Menu,
} from "lucide-react";

const ProductDetailTabs = ({ productData }) => {
  const { id } = useParams();

  // State management
  const [activeTab, setActiveTab] = useState("description");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch user data and product comments
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get("/api/auth/me");
        if (data && data.data) {
          setUser(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${id}/comments`);
        if (response.data && response.data.success) {
          setComments(response.data.comments || []);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    if (id) {
      fetchComments();
    }
  }, [id]);

  // Handle adding new comments
  const addComment = async () => {
    if (!newComment) return;

    try {
      setLoading(true);
      // Prepare comment data
      const commentData = {
        rating: newRating,
        text: newComment,
      };

      // Send to API
      const response = await axios.post(
        `/api/products/${id}/comments`,
        commentData
      );

      if (response.data && response.data.success) {
        // Add the new comment to the existing comments
        setComments([response.data.comment, ...comments]);
        // Clear form
        setNewComment("");
        setNewRating(5);
      } else {
        setError("Error adding comment. Please try again.");
      }
    } catch (err) {
      setError("Error adding comment. Please try again.");
      console.error("Error adding comment:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate rating distribution
  const updateRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    comments.forEach((comment) => {
      distribution[comment.rating] = (distribution[comment.rating] || 0) + 1;
    });

    return Object.keys(distribution).reduce((acc, stars) => {
      const percentage = comments.length
        ? ((distribution[stars] / comments.length) * 100).toFixed(1)
        : 0;
      acc[stars] = percentage;
      return acc;
    }, {});
  };

  const ratingDistribution = updateRatingDistribution();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Set active tab and close mobile menu after selection
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Dynamic star rating component
  const StarRating = ({ rating, onSetRating, interactive = true }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) =>
        interactive ? (
          <div key={star}>
            {star <= (hoverRating || rating) ? (
              <Star
                className="cursor-pointer text-yellow-500"
                size={20}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => onSetRating(star)}
              />
            ) : (
              <Star
                className="cursor-pointer text-gray-300"
                size={20}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => onSetRating(star)}
              />
            )}
          </div>
        ) : (
          <div key={star}>
            {star <= rating ? (
              <Star size={16} className="text-yellow-500" />
            ) : (
              <Star size={16} className="text-gray-300" />
            )}
          </div>
        )
      )}
    </div>
  );

  // If no product data yet, show loading state
  if (!productData && !id) {
    return (
      <div className="p-4 text-center flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading product details...</span>
      </div>
    );
  }

  // Use productData from props if available, otherwise use the original product state
  const product = productData || {};

  // Average rating calculation
  const averageRating = comments.length
    ? (
        comments.reduce((acc, comment) => acc + comment.rating, 0) /
        comments.length
      ).toFixed(1)
    : 0;

  return (
    <div className="container mx-auto py-4 md:py-8 px-2 md:px-4">
      {/* Mobile Tabs with Dropdown */}
      <div className="md:hidden relative mb-6">
        <button
          onClick={toggleMobileMenu}
          className="w-full flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            {activeTab === "description" && (
              <FileText size={18} className="mr-2" />
            )}
            {activeTab === "comments" && (
              <MessageSquare size={18} className="mr-2" />
            )}
            {activeTab === "additional" && <Info size={18} className="mr-2" />}
            {activeTab === "vendor" && <Store size={18} className="mr-2" />}
            <span className="capitalize font-medium">{activeTab}</span>
          </div>
          <Menu size={20} className="text-gray-600" />
        </button>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white mt-1 rounded-lg shadow-lg border border-gray-200 z-10">
            <button
              className={`w-full text-left p-3 flex items-center ${
                activeTab === "description" ? "bg-blue-50 text-blue-600" : ""
              }`}
              onClick={() => handleTabChange("description")}
            >
              <FileText size={18} className="mr-2" />
              Description
            </button>
            <button
              className={`w-full text-left p-3 flex items-center ${
                activeTab === "comments" ? "bg-blue-50 text-blue-600" : ""
              }`}
              onClick={() => handleTabChange("comments")}
            >
              <MessageSquare size={18} className="mr-2" />
              Comments
            </button>
            <button
              className={`w-full text-left p-3 flex items-center ${
                activeTab === "additional" ? "bg-blue-50 text-blue-600" : ""
              }`}
              onClick={() => handleTabChange("additional")}
            >
              <Info size={18} className="mr-2" />
              Additional Info
            </button>
            <button
              className={`w-full text-left p-3 flex items-center ${
                activeTab === "vendor" ? "bg-blue-50 text-blue-600" : ""
              }`}
              onClick={() => handleTabChange("vendor")}
            >
              <Store size={18} className="mr-2" />
              Vendor
            </button>
          </div>
        )}
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex space-x-1 border-b mb-6">
        <button
          className={`pb-2 px-4 text-lg font-medium transition duration-300 flex items-center ${
            activeTab === "description"
              ? "border-b-4 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("description")}
        >
          <FileText size={18} className="mr-2" />
          Description
        </button>
        <button
          className={`pb-2 px-4 text-lg font-medium transition duration-300 flex items-center ${
            activeTab === "comments"
              ? "border-b-4 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("comments")}
        >
          <MessageSquare size={18} className="mr-2" />
          Comments
        </button>
        <button
          className={`pb-2 px-4 text-lg font-medium transition duration-300 flex items-center ${
            activeTab === "additional"
              ? "border-b-4 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("additional")}
        >
          <Info size={18} className="mr-2" />
          Additional Info
        </button>
        <button
          className={`pb-2 px-4 text-lg font-medium transition duration-300 flex items-center ${
            activeTab === "vendor"
              ? "border-b-4 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("vendor")}
        >
          <Store size={18} className="mr-2" />
          Vendor
        </button>
      </div>

      {/* Content for each tab */}
      <div>
        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="animate-fadeIn">
            <p className="text-gray-700 leading-relaxed">
              {product.description || "No description available"}
            </p>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
              {/* Left Column: Add Comment Section */}
              <div className="col-span-1 lg:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
                  <MessageSquare size={20} className="mr-2 text-blue-500" />
                  Share Your Thoughts
                </h4>

                {/* Star Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-gray-700">Your Rating:</span>
                  <StarRating rating={newRating} onSetRating={setNewRating} />
                </div>

                {/* Comment Input */}
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="border p-3 w-full rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
                    placeholder="Write your comment..."
                    disabled={loading}
                  />

                  <button
                    onClick={addComment}
                    disabled={loading || !newComment}
                    className={`absolute bottom-3 right-3 ${
                      loading || !newComment
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white p-2 rounded-full transition duration-300`}
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>

                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

                {!user && (
                  <p className="text-amber-600 mt-2 text-sm">
                    You need to be logged in to post a comment.
                  </p>
                )}
              </div>

              {/* Right Column: Rating Summary Section */}
              <div className="col-span-1 order-first lg:order-none mb-4 lg:mb-0">
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 h-full">
                  <div className="text-center mb-4">
                    <h4 className="text-lg md:text-xl font-semibold">
                      Rating Overview
                    </h4>
                    <div className="flex items-center justify-center mt-2">
                      <span className="text-2xl md:text-3xl font-bold text-blue-600 mr-2">
                        {averageRating}
                      </span>
                      <StarRating
                        rating={Math.round(averageRating)}
                        onSetRating={() => {}}
                        interactive={false}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Based on {comments.length} comment
                      {comments.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    {Object.entries(ratingDistribution)
                      .sort((a, b) => Number(b[0]) - Number(a[0]))
                      .map(([stars, percentage]) => (
                        <div
                          key={stars}
                          className="flex items-center space-x-2"
                        >
                          <span className="flex items-center w-6 text-sm">
                            {stars}
                            <Star size={12} className="ml-1 text-yellow-500" />
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-10">
                            {percentage}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Display Submitted Comments */}
            <div className="mt-6 md:mt-8">
              <h4 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
                <MessageSquare size={20} className="mr-2 text-blue-500" />
                User Comments ({comments.length})
              </h4>

              {loading && comments.length === 0 ? (
                <div className="text-center py-6 md:py-8 flex justify-center">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {comments.map((comment, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex items-start">
                        <div className="mr-3 md:mr-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white overflow-hidden">
                            {comment.user?.avatar ? (
                              <img
                                src={comment.user.avatar}
                                alt={comment.user.firstName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={20} className="md:size-24" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap">
                            <div>
                              <h5 className="font-semibold text-sm md:text-base">
                                {comment.user?.firstName
                                  ? `${comment.user.firstName} ${
                                      comment.user.lastName || ""
                                    }`
                                  : comment.user?.username || "Anonymous"}
                              </h5>
                              <div className="flex items-center mt-1 flex-wrap">
                                <StarRating
                                  rating={comment.rating}
                                  onSetRating={() => {}}
                                  interactive={false}
                                />
                                <span className="text-xs text-gray-500 ml-2">
                                  {comment.createdAt &&
                                    new Date(
                                      comment.createdAt
                                    ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="mt-2 md:mt-3 text-sm md:text-base text-gray-700">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 bg-gray-50 rounded-lg">
                  <MessageSquare
                    size={32}
                    className="mx-auto text-gray-300 mb-2"
                  />
                  <p className="text-gray-500">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Info Tab */}
        {activeTab === "additional" && (
          <div className="animate-fadeIn">
            <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
              <Info size={20} className="mr-2 text-blue-500" />
              Additional Information
            </h3>
            {product.specifications ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {Object.entries(product.specifications).map(
                  ([key, value], idx) => (
                    <li key={idx} className="border p-3 rounded-lg shadow-sm">
                      <strong>{key.replace(/([A-Z])/g, " $1")}: </strong>
                      {value}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {product.dimensions && (
                  <div className="border p-3 rounded-lg shadow-sm">
                    <span className="font-semibold">Dimensions:</span>{" "}
                    {product.dimensions}
                  </div>
                )}
                {product.stock && (
                  <div className="border p-3 rounded-lg shadow-sm">
                    <span className="font-semibold">Stock:</span>{" "}
                    {product.stock} units
                  </div>
                )}
                {product.material && (
                  <div className="border p-3 rounded-lg shadow-sm">
                    <span className="font-semibold">Material:</span>{" "}
                    {product.material}
                  </div>
                )}
                {product.color && (
                  <div className="border p-3 rounded-lg shadow-sm">
                    <span className="font-semibold">Color:</span>{" "}
                    {product.color}
                  </div>
                )}
                {!product.dimensions &&
                  !product.stock &&
                  !product.material &&
                  !product.color && (
                    <div className="col-span-1 md:col-span-2 text-center py-4 text-gray-500">
                      No additional information available for this product.
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {/* Vendor Tab */}
        {activeTab === "vendor" && (
          <div className="animate-fadeIn">
            <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
              <Store size={20} className="mr-2 text-blue-500" />
              Vendor Information
            </h3>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
              <p className="mb-3">
                <span className="font-semibold">Vendor Code:</span>{" "}
                {product.vendor ||
                  product.uploadedBy ||
                  "Information not available"}
              </p>
              {product.location && (
                <p className="mb-3">
                  <span className="font-semibold">Location:</span>{" "}
                  {product.location}
                </p>
              )}
              {product.Email && (
                <p className="mb-3">
                  <span className="font-semibold">Contact:</span>{" "}
                  <a
                    href={`mailto:${product.Email}`}
                    className="text-blue-500 underline break-words"
                  >
                    {product.Email}
                  </a>
                </p>
              )}
              {product.phone && (
                <p className="mb-3">
                  <span className="font-semibold">Phone:</span>{" "}
                  <a href={`tel:${product.phone}`} className="hover:underline">
                    {product.phone}
                  </a>
                </p>
              )}
              {!product.vendor &&
                !product.location &&
                !product.Email &&
                !product.phone &&
                !product.uploadedBy && (
                  <p className="text-center text-gray-500">
                    Vendor information is not available for this product.
                  </p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailTabs;

// Add this CSS to your global styles or component styles
//
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
//
// .animate-fadeIn {
//   animation: fadeIn 0.3s ease-in-out forwards;
// }
