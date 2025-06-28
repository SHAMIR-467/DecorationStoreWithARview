import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft,
  Upload,
  ZoomIn,
  ZoomOut,
  MoveHorizontal,
  Lock,
  RefreshCw,
  Camera,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

// Import SimilarProducts component (reused from your product detail page)

const ARView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const modelViewerRef = useRef(null);

  // States for AR functionality
  const [isARSupported, setIsARSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [isLocked, setIsLocked] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [planeDetected, setPlaneDetected] = useState(false);
  const [guidanceStage, setGuidanceStage] = useState("initial"); // "initial", "scanning", "positioning", "placed"

  // States for product data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screenshotMode, setScreenshotMode] = useState(false);

  // Check AR support, device type, and fetch product data
  useEffect(() => {
    const checkARSupport = async () => {
      if ("xr" in navigator) {
        try {
          const supported = await navigator.xr.isSessionSupported(
            "immersive-ar"
          );
          setIsARSupported(supported);
        } catch (err) {
          console.error("Error checking AR support:", err);
          setIsARSupported(false);
        }
      } else if (window.WebXRPolyfill) {
        setIsARSupported(true); // Polyfill available
      } else {
        setIsARSupported(false);
      }
    };

    const checkDeviceType = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      setIsMobile(
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        )
      );
    };

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

    checkARSupport();
    checkDeviceType();
    fetchProductData();
  }, [id]);

  // Request location permission for better AR placement
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission(true);
          toast.success("Location access granted for better AR placement");
        },
        (err) => {
          toast.warn(
            "Location permission denied. AR placement may be less accurate"
          );
          setLocationPermission(false);
        }
      );
    }
  };

  // Handle image upload for background/environment
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
        toast.success("Environment image uploaded");
      };
      reader.readAsDataURL(file);
    }
  };

  // Increase scale
  const increaseScale = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2.0));
    if (modelViewerRef.current) {
      modelViewerRef.current.scale = `${scale} ${scale} ${scale}`;
    }
  };

  // Decrease scale
  const decreaseScale = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.1));
    if (modelViewerRef.current) {
      modelViewerRef.current.scale = `${scale} ${scale} ${scale}`;
    }
  };

  // Toggle lock position
  const toggleLock = () => {
    setIsLocked(!isLocked);
    if (modelViewerRef.current) {
      // In a real app you'd use the WebXR API properly
      if (isLocked) {
        modelViewerRef.current.setAttribute("ar-status", "not-tracking");
        toast.info("Model position unlocked");
      } else {
        modelViewerRef.current.setAttribute("ar-status", "tracking");
        toast.info("Model position locked");
      }
    }
  };

  // Reset model position and view
  const resetView = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetTurntable();
      setScale(0.5);
      modelViewerRef.current.scale = "0.5 0.5 0.5";
      toast.info("View reset");
    }
  };

  // Take screenshot
  const takeScreenshot = () => {
    setScreenshotMode(true);

    // Hide controls temporarily for clean screenshot
    setTimeout(() => {
      if (modelViewerRef.current) {
        // This is a simplified approach - in a real app, you'd use
        // the model-viewer API's toDataURL method or similar
        const canvas = modelViewerRef.current.querySelector("canvas");
        if (canvas) {
          try {
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `${product?.name || "product"}-ar-view.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Screenshot saved");
          } catch (err) {
            toast.error("Failed to capture screenshot");
            console.error(err);
          }
        }
      }
      setScreenshotMode(false);
    }, 100);
  };

  // Handle AR session start
  const handleARStart = () => {
    if (!locationPermission) {
      requestLocationPermission();
    }

    setGuidanceStage("scanning");
    toast.info("Move your device to detect surfaces");

    // When AR starts, we listen for plane detection events
    if (modelViewerRef.current) {
      modelViewerRef.current.addEventListener("ar-status", (event) => {
        if (event.detail.status === "tracking") {
          setPlaneDetected(true);
          setGuidanceStage("positioning");
          toast.success("Surface detected! Tap to place the item");
        } else if (event.detail.status === "failed") {
          toast.error(
            "AR tracking failed. Please try again in a well-lit area."
          );
          setError("AR tracking failed. Please try again in a well-lit area.");
        }
      });

      // Listen for model placement
      modelViewerRef.current.addEventListener("model-placement", () => {
        setGuidanceStage("placed");
        toast.success("Item placed in your space!");
      });
    }
  };

  const handlePlacement = () => {
    setGuidanceStage("placed");
    toast.success("Item placed successfully!");
    // In a real implementation, you'd use the WebXR API to finalize placement
  };

  // Return to product detail page
  const handleBack = () => {
    navigate(`/home/product/${id}`);
  };

  if (loading) {
    return (
      <div className="w-full h-[90vh] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading AR experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[90vh] flex items-center justify-center bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg max-w-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Product
          </button>
        </div>
      </div>
    );
  }

  // Get model URL from product data
  const modelUrl =
    product?.modelUrl || product?.modelFile?.url || "/default-model.glb";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full h-[70vh] relative bg-gray-100">
        {/* AR/3D Viewer */}
        <model-viewer
          ref={modelViewerRef}
          src={modelUrl}
          ios-src={modelUrl.replace(".glb", ".usdz")}
          alt={product?.name || "3D Model"}
          camera-controls
          shadow-intensity="2"
          touch-action="pan-y"
          ar
          ar-modes={isMobile ? "webxr scene-viewer quick-look" : "webxr"}
          ar-placement="floor"
          ar-scale="auto"
          scale={`${scale} ${scale} ${scale}`}
          style={{
            width: "100%",
            height: "100%",
            background: backgroundImage
              ? `url(${backgroundImage}) center/cover`
              : "#f9fafb",
          }}
          environment-image={backgroundImage || "neutral"}
          exposure="1.0"
          onARSessionStarted={() => handleARStart()}
        >
          {/* Product Info Overlay */}
          {!screenshotMode && (
            <div className="absolute top-20 left-4 max-w-xs bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
              <h3 className="font-bold text-lg">{product?.name}</h3>
              <p className="text-gray-700 text-sm mt-1">
                ${product?.discountedPrice || product?.price}
                {product?.price !== product?.discountedPrice && (
                  <span className="ml-2 text-xs text-gray-500 line-through">
                    ${product?.price}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {product?.dimensions}
              </p>
            </div>
          )}

          {/* User Guidance Based on Stage */}
          {!screenshotMode && (
            <div
              className={`absolute top-24 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 -mt-20 rounded-lg shadow-md transition-opacity duration-300 ${
                guidanceStage === "placed" ? "opacity-0" : "opacity-100"
              }`}
            >
              {guidanceStage === "initial" && (
                <p className="text-sm text-center">
                  Tap "View in Your Space" to begin AR experience
                </p>
              )}
              {guidanceStage === "scanning" && (
                <p className="text-sm text-center">
                  Move your device slowly to detect surfaces
                </p>
              )}
              {guidanceStage === "positioning" && (
                <p className="text-sm text-center">
                  Tap on a surface to place the item
                </p>
              )}
            </div>
          )}

          {/* Controls Container - Only show when model is placed or in preview mode */}
          {!screenshotMode &&
            (guidanceStage === "placed" || guidanceStage === "initial") && (
              <div className="fixed bottom-20 -mb-20   left-1/2 transform -translate-x-1/2 z-100 bg-white bg-opacity-90 rounded-full shadow-lg p-2 flex items-center space-x-3">
                <motion.button
                  className="p-3 rounded-full bg-gray-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={decreaseScale}
                  aria-label="Decrease size"
                >
                  <ZoomOut className="w-5 h-5" />
                </motion.button>

                <motion.button
                  className="p-3 rounded-full bg-gray-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={increaseScale}
                  aria-label="Increase size"
                >
                  <ZoomIn className="w-5 h-5" />
                </motion.button>
              </div>
            )}

          {/* Upload Environment Button */}
          {!screenshotMode && (
            <div className="fixed top-6 right-6 z-10">
              <motion.label
                className="flex items-center gap-2 bg-white shadow-lg rounded-full p-3 cursor-pointer hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="w-6 h-6" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </motion.label>
            </div>
          )}

          {/* AR Button with enhanced positioning logic */}
          {!screenshotMode && isARSupported && (
            <button
              slot="ar-button"
              className="absolute right-4 bottom-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isMobile ? "View in Your Space" : "Start AR Experience"}
            </button>
          )}

          {/* Location Permission Warning */}
          {!screenshotMode && isARSupported && !locationPermission && (
            <div className="absolute left-4 bottom-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg max-w-xs">
              <p className="text-sm">
                Location access improves AR placement accuracy.
              </p>
              <button
                onClick={requestLocationPermission}
                className="mt-1 text-xs text-indigo-600 underline"
              >
                Grant Access
              </button>
            </div>
          )}

          {/* Fallback Message */}
          {!screenshotMode && !isARSupported && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg"></div>
          )}
        </model-viewer>

        {/* Placement confirmation button - only show in positioning stage */}
        {!screenshotMode && guidanceStage === "positioning" && (
          <button
            onClick={handlePlacement}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Place Here
          </button>
        )}

        {/* Back Button */}
        {!screenshotMode && (
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors flex items-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 mr-1" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* AR Instructions */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            How to Use AR View
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-3">
                <span className="h-6 w-6 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold">
                  1
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">
                  Scan Your Environment
                </h3>
                <p className="text-gray-600 text-sm">
                  Move your device around to detect horizontal surfaces where
                  you can place the item.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-3">
                <span className="h-6 w-6 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold">
                  2
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">
                  Position the Item
                </h3>
                <p className="text-gray-600 text-sm">
                  Once a surface is detected, tap to place the item where you
                  want it in your space.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-3">
                <span className="h-6 w-6 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold">
                  3
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Adjust Size</h3>
                <p className="text-gray-600 text-sm">
                  Use the size controls to make the item larger or smaller to
                  match your space.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-3">
                <span className="h-6 w-6 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold">
                  4
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">
                  Take a Screenshot
                </h3>
                <p className="text-gray-600 text-sm">
                  Capture how the item looks in your space to share or save for
                  later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARView;
