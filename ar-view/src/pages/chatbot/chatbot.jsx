import { useState, useEffect, useRef } from "react";
import { FaRobot, FaTimes, FaShoppingCart } from "react-icons/fa";
import { PulseLoader } from "react-spinners";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import axios from "axios";
import "./chatbot.css";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "../../assets/reducx/slices/authSlice";

function Chatbot() {
  // Essential state management
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isResponseGenerating, setIsResponseGenerating] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topRecommendations, setTopRecommendations] = useState([]);
  const messagesEndRef = useRef(null);

  // API configuration
  const apiKey = "AIzaSyDXwkZr8HQnKU24amKNn1o5udaxASZ6x4o";

  const apiEndpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  // "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent";
  const LOCAL_STORAGE_KEY = "decorDream_chatHistory";

  // Redux integration
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const userId = currentUser?._id;

  // Fetch user data if needed
  useEffect(() => {
    if (isAuthenticated && !currentUser) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, currentUser, dispatch]);

  // Initialize chat when opened
  useEffect(() => {
    if (isChatbotOpen) {
      if (userId) {
        fetchChatHistory();
      } else {
        loadLocalChatHistory();
      }
    }
  }, [userId, isChatbotOpen]);

  // Save non-authenticated user chats to local storage
  useEffect(() => {
    if (chatMessages.length > 0 && !userId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chatMessages));
    }
  }, [chatMessages, userId]);

  // Auto-scroll to latest messages
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Helpers
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadLocalChatHistory = () => {
    try {
      const localHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localHistory) {
        const parsedHistory = JSON.parse(localHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          setChatMessages(parsedHistory);

          // Extract any product recommendations from the history
          const productsFromHistory = parsedHistory
            .filter((msg) => msg.products && msg.products.length > 0)
            .flatMap((msg) => msg.products);

          if (productsFromHistory.length > 0) {
            setTopRecommendations(productsFromHistory.slice(0, 3));
          }

          return;
        }
      }
      // Set default welcome message if no history
      setDefaultWelcomeMessage();
    } catch (error) {
      console.error("Error loading local chat history:", error);
      setDefaultWelcomeMessage();
    }
  };

  const setDefaultWelcomeMessage = () => {
    setChatMessages([
      {
        text: "Hello! I'm your DecorDream AI Assistant. How can I help you today? You can ask about our furniture, accessories, or any home decor items.",
        type: "incoming",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // API functions
  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/chat/history/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data && response.data.length > 0) {
        setChatMessages(response.data);

        // Extract any product recommendations from the API response
        const productsFromHistory = response.data
          .filter((msg) => msg.products && msg.products.length > 0)
          .flatMap((msg) => msg.products);

        if (productsFromHistory.length > 0) {
          setTopRecommendations(productsFromHistory.slice(0, 3));
        }
      } else {
        setDefaultWelcomeMessage();
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      loadLocalChatHistory(); // Fallback to local storage if API fails
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatMessage = async (message) => {
    if (!userId) return; // Only save to backend if user is logged in

    try {
      await axios.post(
        `/api/chat/message`,
        {
          userId,
          message: {
            text: message.text,
            type: message.type,
            timestamp: message.timestamp || new Date().toISOString(),
            ...(message.products && { products: message.products }),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error saving chat message:", error);
      // Continue even if save fails - messages will be in local state
    }
  };

  const clearChatHistory = async () => {
    try {
      if (userId) {
        // Clear from backend for logged in users
        await axios.delete(`/api/chat/history/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } else {
        // Clear from local storage for non-authenticated users
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }

      setTopRecommendations([]);
      setDefaultWelcomeMessage();
    } catch (error) {
      console.error("Error clearing chat history:", error);
      // Still clear local state even if API fails
      setTopRecommendations([]);
      setDefaultWelcomeMessage();
    }
  };

  const generateAPIResponse = async (prompt) => {
    try {
      const response = await fetch(`${apiEndpoint}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a home decor AI assistant for the DecorDream e-commerce store. 
              Answer the following query with helpful information about home decor. 
              If the user is asking for suggestions, recommend appropriate home decor items.
              Keep responses concise and helpful. User query: ${prompt}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return (
        data.candidates[0]?.content?.parts[0]?.text ||
        "I couldn't process your request. Please try again."
      );
    } catch (error) {
      console.error("Error generating API response:", error);
      return "I apologize, but I encountered an error processing your request. Please try again.";
    }
  };

  const searchRelevantProducts = async (userQuery) => {
    try {
      const { keywords, categories } = extractSearchTerms(userQuery);

      if (keywords.length === 0 && categories.length === 0) {
        return []; // No relevant keywords found
      }

      // Build search query from both keywords and categories
      const searchQuery = [...keywords, ...categories].join(" ");

      const response = await axios.get(`/api/products/search`, {
        params: {
          query: searchQuery,
          category: categories.length > 0 ? categories.join(",") : undefined,
          limit: 3,
        },
      });

      // Update top recommendations with the found products
      if (response.data && response.data.length > 0) {
        setTopRecommendations(response.data);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  };

  const extractSearchTerms = (text) => {
    const lowercaseText = text.toLowerCase();

    // Define product categories
    const categories = {
      furniture: [
        "sofa",
        "chair",
        "table",
        "bed",
        "shelf",
        "cabinet",
        "dresser",
        "nightstand",
        "bookcase",
      ],
      electronic: [
        "lamp",
        "light",
        "smart",
        "speaker",
        "gadget",
        "device",
        "tech",
      ],
      handmade: ["handmade", "artisan", "crafted", "handcrafted", "custom"],
      accessories: [
        "vase",
        "bowl",
        "tray",
        "candle",
        "holder",
        "accessory",
        "decor",
        "decoration",
      ],
      clothing: ["cushion", "pillow", "throw", "blanket", "cover", "textile"],
      crafting: ["craft", "diy", "make", "kit", "supplies"],
      stationery: ["stationery", "desk", "organizer", "office"],
      sports: ["outdoor", "patio", "garden", "sports"],
      others: ["wall", "art", "mirror", "clock", "plant", "storage"],
    };

    // Style keywords
    const styleKeywords = [
      "modern",
      "vintage",
      "rustic",
      "minimalist",
      "contemporary",
      "traditional",
      "industrial",
      "bohemian",
      "coastal",
      "farmhouse",
      "scandinavian",
      "mid-century",
    ];

    // Room keywords
    const roomKeywords = [
      "bedroom",
      "living room",
      "dining",
      "kitchen",
      "bathroom",
      "office",
      "outdoor",
      "patio",
      "hallway",
      "entryway",
    ];

    // Material and color keywords
    const materialColorKeywords = [
      "wood",
      "glass",
      "metal",
      "leather",
      "fabric",
      "cotton",
      "linen",
      "velvet",
      "white",
      "black",
      "gray",
      "blue",
      "green",
      "red",
      "brown",
      "beige",
    ];

    // Get matched categories
    const matchedCategories = Object.keys(categories).filter((category) => {
      // Direct match with category name
      if (lowercaseText.includes(category)) return true;

      // Match with category items
      return categories[category].some((item) => lowercaseText.includes(item));
    });

    // Get all potential keywords
    const allKeywords = [
      ...styleKeywords,
      ...roomKeywords,
      ...materialColorKeywords,
      ...Object.values(categories).flat(),
    ];

    // Find matched keywords
    const matchedKeywords = allKeywords.filter((keyword) =>
      lowercaseText.includes(keyword)
    );

    return {
      keywords: matchedKeywords,
      categories: matchedCategories,
    };
  };

  // Core functionality
  const handleOutgoingChat = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || isResponseGenerating) return;

    setIsResponseGenerating(true);
    const newUserMessage = {
      text: userMessage.trim(),
      type: "outgoing",
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newUserMessage]);
    setUserMessage("");

    try {
      // Handle special commands
      if (newUserMessage.text.toLowerCase() === "clear chat") {
        await clearChatHistory();
        setIsResponseGenerating(false);
        return;
      }

      // Process normal message flow
      if (userId) {
        await saveChatMessage(newUserMessage);
      }

      // Find relevant products and generate AI response in parallel
      const [relevantProducts, botResponseText] = await Promise.all([
        searchRelevantProducts(newUserMessage.text),
        generateAPIResponse(newUserMessage.text),
      ]);

      // Create and send response
      const responseMessage = {
        text: botResponseText,
        type: "incoming",
        timestamp: new Date().toISOString(),
        ...(relevantProducts.length > 0 && { products: relevantProducts }),
      };

      setChatMessages((prev) => [...prev, responseMessage]);

      if (userId) {
        await saveChatMessage(responseMessage);
      }
    } catch (error) {
      console.error("Error in chat handling:", error);

      // Add error message to chat
      const errorMessage = {
        text: "I apologize, but I encountered an error. Please try again.",
        type: "incoming",
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsResponseGenerating(false);
    }
  };

  // UI components and rendering
  const formatMessage = (message) => {
    // Error handling for null or invalid message structure
    if (!message)
      return <div className="text-gray-400 italic">No message available</div>;

    // Extract message parts safely with fallbacks
    const text = message.text || "";
    const products = message.products || [];
    const recommendations = message.recommendations || [];

    // Process message text for display with error handling
    const renderedText = text.split("\n").map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={`empty-${index}`} className="h-2" />;

      // Handle bold text with error handling
      const formattedLine = trimmedLine
        .split(/(\*\*.*?\*\*)/g)
        .map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong
                key={i}
                className="font-bold bg-yellow-50 px-2 mx-1 rounded-md"
              >
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

      // Handle URLs with improved error handling
      if (trimmedLine.startsWith("http")) {
        try {
          const url = new URL(trimmedLine);
          return (
            <a
              key={`link-${index}`}
              href={trimmedLine}
              target="_blank"
              rel="noopener noreferrer"
              className="block my-2 text-blue-600 hover:text-blue-800 underline transition-colors duration-300"
            >
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                {url.hostname}
              </div>
            </a>
          );
        } catch (e) {
          // Handle invalid URLs gracefully
          return (
            <p key={`text-${index}`} className="my-1">
              {trimmedLine}
            </p>
          );
        }
      }

      // Handle images
      if (trimmedLine.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return (
          <div key={`img-${index}`} className="my-2 flex justify-center">
            <div className="relative group">
              <img
                src={trimmedLine}
                alt="Product"
                className="max-w-full rounded-lg shadow-lg hover:shadow-xl transition duration-300"
                style={{ maxHeight: "300px" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/400/300";
                  e.target.alt = "Image failed to load";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg"></div>
            </div>
          </div>
        );
      }

      // Handle headings
      if (trimmedLine.startsWith("#")) {
        const headingMatch = trimmedLine.match(/^(#+)\s*(.*)/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const text = headingMatch[2];
          const sizeClasses = {
            1: "text-2xl font-bold my-3 text-gray-800 border-b border-gray-200 pb-2",
            2: "text-xl font-bold my-2 text-gray-700",
            3: "text-lg font-bold my-2 text-gray-600",
          };
          const className = sizeClasses[level] || "text-base font-bold my-1";

          return (
            <div key={`heading-${index}`} className={className}>
              {text}
            </div>
          );
        }
      }

      // Handle list items
      // Enhanced list item handling that processes both regular and bold text in a single function
      if (trimmedLine.startsWith("*")) {
        const listText = trimmedLine.substring(1).trim();

        // Check if the list item contains bold text (** **)
        if (listText.includes("**")) {
          // Split the text by the bold markers
          const parts = listText.split(/(\*\*.*?\*\*)/g);

          const formattedParts = parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              // This is bold text
              return (
                <strong
                  key={i}
                  className="font-bold bg-yellow-50 px-2 mx-1 rounded-md"
                >
                  {part.slice(2, -2)}
                </strong>
              );
            }
            // Regular text
            return part;
          });

          // Return list item with bold formatting
          return (
            <div
              key={`list-${index}`}
              className="flex items-start space-x-2 my-1 pl-4"
            >
              <span className="text-purple-500 mt-1">•</span>
              <span>{formattedParts}</span>
            </div>
          );
        } else {
          // Regular list item without bold text
          return (
            <div
              key={`list-${index}`}
              className="flex items-start space-x-2 my-1 pl-4"
            >
              <span className="text-green-900 mt-1">•</span>
              <span>{listText}</span>
            </div>
          );
        }
      }

      // Default paragraph
      return (
        <p key={`text-${index}`} className="my-1 text-gray-700">
          {formattedLine}
        </p>
      );
    });

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="prose max-w-none">{renderedText}</div>

        {/* Product Recommendations Section */}
        {products && products.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-purple-700 flex items-center mb-3">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z"
                  clipRule="evenodd"
                />
              </svg>
              Recommended Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id || `product-${Math.random()}`}
                  product={product}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    // Default values in case of missing data
    const {
      _id = "unknown",
      name = "Product Name",
      price = 0,
      currency = "USD",
      description = "No description available",
      imageUrl = "/api/placeholder/300/300",
      discount = 0,
      rating = 0,
      reviews = 0,
      category = "",
    } = product;

    // Calculate discounted price
    const originalPrice = price;
    const discountedPrice = discount
      ? (price * (1 - discount / 100)).toFixed(2)
      : null;

    const handleNavigate = (e) => {
      e.preventDefault();
      try {
        window.location.href = `/product/${_id}`;
      } catch (error) {
        console.error("Navigation error:", error);
      }
    };

    // Render star rating
    const renderStars = (rating) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;

      // Full stars
      for (let i = 0; i < fullStars; i++) {
        stars.push(
          <svg
            key={`star-${i}`}
            className="w-4 h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }

      // Half star
      if (hasHalfStar) {
        stars.push(
          <svg
            key="half-star"
            className="w-4 h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <defs>
              <linearGradient id="halfGradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path
              fill="url(#halfGradient)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        );
      }

      // Empty stars
      const emptyStars = 5 - stars.length;
      for (let i = 0; i < emptyStars; i++) {
        stars.push(
          <svg
            key={`empty-star-${i}`}
            className="w-4 h-4 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }

      return <div className="flex">{stars}</div>;
    };

    return (
      <motion.div
        className="flex-shrink-0 w-48 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleNavigate}
        whileHover={{ scale: 1.02 }}
        style={{ cursor: "pointer" }}
      >
        {/* Shine effect overlay */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              left: ["-100%", "100%"],
              top: ["-100%", "100%"],
            }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
              transform: "skewX(-20deg)",
              zIndex: 2,
            }}
          />
        )}

        <div className="h-32 overflow-hidden">
          <img
            src={imageUrl || "/placeholder-product.jpg"}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-product.jpg";
            }}
          />
          {category && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {category}
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {name}
          </h3>
          <p className="mt-1 text-sm text-gray-700 font-bold">
            ${parseFloat(price).toFixed(2) || "0.00"}
          </p>
          {rating > 0 && (
            <div className="mt-1 flex items-center">
              {renderStars(rating)}
              <span className="ml-1 text-xs text-gray-500">
                ({reviews || 0})
              </span>
            </div>
          )}
          <button
            onClick={handleNavigate}
            className="mt-2 w-full flex items-center justify-center gap-1 bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700 transition-colors"
          >
            <FaShoppingCart size={12} />
            <span>View Details</span>
          </button>
        </div>
      </motion.div>
    );
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <>
      {/* Chat Button */}
      {!isChatbotOpen && (
        <motion.button
          onClick={toggleChatbot}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50"
          aria-label="Open chat"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaRobot size={24} />
        </motion.button>
      )}

      {/* Chat Window */}
      {isChatbotOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl w-80 md:w-96 h-[500px] max-h-[80vh] z-50 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
            <div className="flex items-center">
              <Bot className="mr-2" size={20} />
              <h3 className="font-medium">DecorDream Assistant</h3>
            </div>
            <button
              onClick={toggleChatbot}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Top recommendations if available */}
          {topRecommendations.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center overflow-x-auto scrollbar-thin">
              <span className="text-xs font-semibold text-gray-500 mr-2 shrink-0">
                Popular Items:
              </span>
              <div className="flex gap-2">
                {topRecommendations.map((product) => (
                  <a
                    key={product._id}
                    href={`/product/${product._id}`}
                    className="shrink-0 group"
                  >
                    <div className="w-12 h-12 border border-gray-200 rounded overflow-hidden">
                      <img
                        src={product.imageUrl || "/placeholder-product.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <PulseLoader color="#4B5563" size={10} />
              </div>
            ) : (
              <>
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.type === "outgoing"
                        ? "justify-end"
                        : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`${
                        message.type === "outgoing"
                          ? "bg-blue-600 text-white rounded-l-lg rounded-tr-lg"
                          : "bg-white text-gray-800 rounded-r-lg rounded-tl-lg shadow-md"
                      } max-w-[80%]`}
                    >
                      {message.type === "outgoing" ? (
                        <div className="p-3 break-words">{message.text}</div>
                      ) : (
                        formatMessage(message)
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Suggestions */}
          {chatMessages.length <= 2 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-1">
                {[
                  "Show me modern sofas",
                  "What's trending in home decor?",
                  "Recommend dining tables",
                  "Help me decorate my home",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full text-gray-600 hover:bg-gray-200 hover:border-gray-300 transition-colors"
                    onClick={() => {
                      setUserMessage(suggestion);
                      // Submit the form with a slight delay to show the user what was clicked
                      setTimeout(() => {
                        const fakeEvent = { preventDefault: () => {} };
                        handleOutgoingChat(fakeEvent);
                      }, 100);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleOutgoingChat}
            className="border-t border-gray-200 p-4 bg-white"
          >
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-full pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ask about decor items..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                disabled={isResponseGenerating}
              />
              <button
                type="submit"
                disabled={isResponseGenerating || !userMessage.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 ${
                  isResponseGenerating || !userMessage.trim()
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50"
                } transition-colors`}
              >
                {isResponseGenerating ? (
                  <PulseLoader color="#4B5563" size={5} />
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
            <span>Powered by DecorDream AI</span>
            <button
              onClick={clearChatHistory}
              className="text-gray-500 hover:text-gray-700 text-xs hover:underline"
            >
              Clear Chat
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default Chatbot;
