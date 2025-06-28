import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCurrentUser, logout } from "../../assets/reducx/slices/authSlice";
import jar from "../../assets/images/jar.jpg";
import { Upload, Download, X } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ProductUpload = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [images, setImages] = useState([]);
  const [productData, setProductData] = useState({
    productName: "",
    category: "",
    description: "",
    price: "",
    discountedPrice: "",
    stock: "",
    dimensions: "",
  });

  // 3D Model states
  const [model3D, setModel3D] = useState(null);
  const [model3DPreview, setModel3DPreview] = useState(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [modelGenerating, setModelGenerating] = useState(false);
  const [generatedModelBlob, setGeneratedModelBlob] = useState(null);

  // Three.js refs
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Model generation settings
  const [modelSettings, setModelSettings] = useState({
    textureResolution: "1024",
    foregroundRatio: 0.85,
    remesh: "none",
    vertexCount: -1,
    modelType: "fast3d",
  });

  // API key for 3D model generation
  const API_KEY = "sk-UHzPtiodRkoVy80B968Pz5noniVTEUOVEmRu4EHwLYUdOxoT"; //   "sk-czA1NnnBp4ADe1b2i2LI9Nd8EiSHyrK2uD6JNExGiMGz5TSb";

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!accessToken) {
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch (err) {
          console.error("Auth Check Failed:", err);
          navigate("/auth/login");
        }
      }
    };
    checkAuth();
  }, [accessToken, dispatch, navigate]);

  // Clean up Three.js resources on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Initialize Three.js when model and canvas are ready
  useEffect(() => {
    if (canvasRef.current && generatedModelBlob && showModelModal) {
      initThreeJS();
    }
  }, [generatedModelBlob, showModelModal]);

  // Validate form inputs
  const validateForm = () => {
    if (!productData.productName.trim())
      throw new Error("Product name is required");
    if (!productData.category) throw new Error("Category is required");
    if (!productData.price || Number(productData.price) <= 0)
      throw new Error("Valid price is required");
    if (!productData.stock || Number(productData.stock) < 0)
      throw new Error("Valid stock quantity is required");
    if (
      productData.discountedPrice &&
      Number(productData.discountedPrice) >= Number(productData.price)
    ) {
      throw new Error("Discounted price must be less than regular price");
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      setError("Maximum 5 images allowed.");
      return;
    }

    const validFiles = files.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      );
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError("Invalid file type or size. Use JPEG/PNG/WEBP under 5MB.");
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  // Handle 3D model upload
  const handle3DModelUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.name.endsWith(".glb") && !file.name.endsWith(".gltf")) {
      setError("Please upload a valid 3D model (GLB or GLTF format)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      // 20MB limit
      setError("Model file is too large. Maximum size is 20MB.");
      return;
    }

    setModel3D(file);
    setModel3DPreview(URL.createObjectURL(file));
    setError(null);
  };

  // Initialize Three.js for model preview
  const initThreeJS = () => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    const container = canvasRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientWidth || 300; // Square viewport

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Clean up previous renderer if exists
    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controlsRef.current = controls;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-1, -1, -1);
    scene.add(backLight);

    if (!generatedModelBlob) return;

    const loader = new GLTFLoader();
    const url = URL.createObjectURL(generatedModelBlob);

    loader.load(
      url,
      (gltf) => {
        scene.add(gltf.scene);

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        camera.position.z = cameraZ * 1.5;
        camera.lookAt(center);

        controls.target.copy(center);
        controls.update();

        animate();

        URL.revokeObjectURL(url);
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
        setError("Failed to load 3D model: " + error.message);
      }
    );
  };

  const animate = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    animationFrameRef.current = requestAnimationFrame(animate);
    controlsRef.current?.update();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  // Generate 3D model from first image
  const generate3DModel = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image to generate a 3D model");
      return;
    }

    setModelGenerating(true);
    setError(null);

    const firstImage = images[0];
    const formData = new FormData();
    formData.append("image", firstImage);
    formData.append("texture_resolution", modelSettings.textureResolution);
    formData.append("foreground_ratio", modelSettings.foregroundRatio);
    formData.append("remesh", modelSettings.remesh);
    formData.append("vertex_count", modelSettings.vertexCount);

    const apiEndpoint =
      modelSettings.modelType === "fast3d"
        ? "https://api.stability.ai/v2beta/3d/stable-fast-3d"
        : "https://api.stability.ai/v2beta/3d/stable-point-aware-3d";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error: ${response.status} ${response.statusText}`
        );
      }

      const modelData = await response.arrayBuffer();
      const blob = new Blob([modelData], { type: "model/gltf-binary" });

      setGeneratedModelBlob(blob);

      // Create a file from blob
      const modelFile = new File([blob], "generated_model.glb", {
        type: "model/gltf-binary",
      });
      setModel3D(modelFile);
      setModel3DPreview(URL.createObjectURL(blob));
    } catch (err) {
      console.error("3D model generation error:", err);
      setError("Failed to generate 3D model: " + err.message);
    } finally {
      setModelGenerating(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [id]: id === "productName" ? value : value.trim(),
    }));
    setError(null);
  };

  // Handle model settings changes
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setModelSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open 3D model modal
  const openModelModal = () => {
    setShowModelModal(true);
  };

  // Close 3D model modal
  const closeModelModal = () => {
    setShowModelModal(false);

    // Cancel animation frame when closing modal
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      validateForm();

      if (images.length === 0)
        throw new Error("At least one image is required");

      // Create FormData object
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      formData.append("userId", user._id);

      // Important: Match backend's expected format for images
      images.forEach((image) => {
        formData.append("images", image);
      });

      // Append 3D model if available
      if (model3D) {
        formData.append("model3D", model3D);
      }

      // Set longer timeout for file uploads
      const response = await axios.post("/api/product", formData, {
        headers: {
          // ✅ Let Axios handle Content-Type for FormData automatically
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 30000, // Optional: in case upload is big
      });

      console.log("Server Response:", response.data);

      setSuccess("Product uploaded successfully!");
      setProductData({
        productName: "",
        category: "",
        description: "",
        price: "",
        discountedPrice: "",
        stock: "",
        dimensions: "",
      });
      setImages([]);
      setModel3D(null);
      setModel3DPreview(null);

      setTimeout(() => {
        navigate("/admin/product-view", {
          state: { product: response.data.product },
        });
      }, 1500);
    } catch (err) {
      console.error("Error submitting product:", err);

      let errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while uploading the product.";

      if (
        err.response?.status === 401 &&
        err.response?.data?.message === "JWT expired"
      ) {
        errorMessage = "Session expired. Please log in again.";
        dispatch(logout());
        navigate("/auth/login");
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex justify-center items-center p-8">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden flex">
        {/* Left Image Section */}
        <div className="hidden md:block w-1/3 bg-purple-50 flex justify-center items-center p-6">
          <img
            src={jar}
            alt="Product Upload"
            className="max-h-96 object-contain transform transition-transform hover:scale-105"
          />
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-2/3 p-6 space-y-6">
          <h1 className="text-3xl font-bold text-purple-600 text-center">
            Upload Product Information
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="productName"
                  className="block text-sm font-semibold text-gray-600 mb-1"
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  id="productName"
                  value={productData.productName}
                  onChange={handleInputChange}
                  className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-300 p-2"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-600 mb-1"
                >
                  Category *
                </label>
                <select
                  id="category"
                  value={productData.category}
                  onChange={handleInputChange}
                  className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-300 p-2"
                >
                  <option value="">Select category</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hand made">Hand made</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Crafting">Crafting</option>
                  <option value="Stationary">Stationary</option>
                  <option value="Sports">Sports</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-600 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={productData.description}
                onChange={handleInputChange}
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-300 p-2"
                rows="3"
                placeholder="Write a brief description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-semibold text-gray-600 mb-1"
                >
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  id="price"
                  value={productData.price}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-300 p-2"
                />
              </div>

              <div>
                <label
                  htmlFor="discountedPrice"
                  className="block text-sm font-semibold text-gray-600 mb-1"
                >
                  Discounted Price
                </label>
                <input
                  type="number"
                  id="discountedPrice"
                  value={productData.discountedPrice}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-300 p-2"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-semibold text-gray-600 mb-1"
                >
                  Stock *
                </label>
                <input
                  type="number"
                  id="stock"
                  value={productData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-300 p-2"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="dimensions"
                className="block text-sm font-semibold text-gray-600 mb-1"
              >
                Dimensions
              </label>
              <input
                type="text"
                id="dimensions"
                value={productData.dimensions}
                onChange={handleInputChange}
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-300 p-2"
                placeholder="e.g., 10x10x10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Upload Images *
              </label>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-md relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <p className="text-center text-gray-500">
                  Drop images here or click to browse (Max 5 images)
                </p>
              </div>

              {images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Array.from(images).map((image, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 border rounded-md overflow-hidden"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3D Model Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                3D Model (Optional)
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 border-2 border-dashed border-gray-300 p-3 rounded-md relative">
                  <input
                    type="file"
                    accept=".glb,.gltf"
                    onChange={handle3DModelUpload}
                    id="model-upload"
                    name="model3D"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <p className="text-center text-gray-500 text-sm">
                    Upload 3D model (GLB/GLTF)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openModelModal}
                  className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  Generate 3D
                </button>
              </div>

              {model3DPreview && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                    <span className="text-purple-500 text-xs">3D</span>
                  </div>
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {model3D.name || "3D Model"}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md transition-all duration-300 
              ${
                loading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white`}
            >
              {loading ? "Uploading..." : "Upload Product"}
            </button>
          </form>
        </div>
      </div>

      {/* 3D Model Generation Modal */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                3D Model Generator
              </h2>
              <button
                onClick={closeModelModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {images.length === 0 ? (
                <div className="text-center py-6 text-red-500">
                  Please upload at least one image before generating a 3D model
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">
                        Source Image
                      </h3>
                      {images.length > 0 && (
                        <div className="border rounded-md overflow-hidden">
                          <img
                            src={URL.createObjectURL(images[0])}
                            alt="Source"
                            className="w-full object-contain max-h-64"
                          />
                        </div>
                      )}

                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Model Type
                          </label>
                          <select
                            name="modelType"
                            value={modelSettings.modelType}
                            onChange={handleSettingsChange}
                            className="w-full border rounded-md px-3 py-2"
                          >
                            <option value="fast3d">Stable Fast 3D</option>
                            <option value="spar3d">
                              Stable Point Aware 3D
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Texture Resolution
                          </label>
                          <select
                            name="textureResolution"
                            value={modelSettings.textureResolution}
                            onChange={handleSettingsChange}
                            className="w-full border rounded-md px-3 py-2"
                          >
                            <option value="512">512</option>
                            <option value="1024">1024</option>
                            <option value="2048">2048</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">
                        3D Model Preview
                      </h3>
                      <div
                        ref={canvasRef}
                        className="w-full aspect-square bg-gray-100 rounded-md"
                      >
                        {!generatedModelBlob && (
                          <div className="h-full w-full flex items-center justify-center">
                            <p className="text-gray-500">
                              No model generated yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={generate3DModel}
                      disabled={modelGenerating || images.length === 0}
                      className={`px-6 py-2 rounded-md text-white ${
                        modelGenerating || images.length === 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {modelGenerating ? "Generating..." : "Generate 3D Model"}
                    </button>

                    {generatedModelBlob && (
                      <button
                        type="button"
                        onClick={closeModelModal}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Use This Model
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductUpload;
