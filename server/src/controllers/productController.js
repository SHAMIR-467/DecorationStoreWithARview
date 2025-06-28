import Product from "../models/Product.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../utils/asyncHandler.js";

import fs from "fs";
// Get all products with advanced filtering, pagination, and sorting
export const getAllProducts = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 200, 
    sortBy = "createdAt", 
    order = "Aesc", 
    category,
    minPrice,
    maxPrice,
    inStock 
  } = req.query;

  // Build filter object
  const filter = {};
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (inStock === 'true') filter.stock = { $gt: 0 };

  const sortOption = { [sortBy]: order === "asc" ? 1 : -1 };

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("uploadedBy", "name email")
    .sort(sortOption)
    .skip((page - 1) * Number(limit))
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    products
  });
});

// Get single product with detailed information
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    //.populate("uploadedBy", "name email")
   // .populate("reviews.user", "name email");

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  res.status(200).json({
    success: true,
    product
  });
});
   
export const createProduct = asyncHandler(async (req, res) => {
  const {
    productName,
    category,
    description,
    price,
    discountedPrice,
    stock,
    dimensions,
  } = req.body;

  // Validation for required fields
  if (!productName || !category || !price || !stock) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  let uploadedImages = [];
  let uploadedModel3D = null;

  try {
    // **✅ Handling Images Upload**
    if (req.files?.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of imageFiles) {
        const cloudinaryResponse = await uploadOnCloudinary(file.path);

        fs.unlink(file.path, (err) => {
          if (err) console.error("Failed to remove temp file:", err);
        });

        if (cloudinaryResponse) {
          uploadedImages.push({
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          });
        } else {
          console.error("Failed to upload image:", file.originalname || file.name);
        }
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

   
    if (req.files?.model3D) {
  // Ensure modelFiles is always an array
  const modelFiles = Array.isArray(req.files.model3D)
    ? req.files.model3D
    : [req.files.model3D];

  // Process the first model file (or loop through all if needed)
  const modelFile = modelFiles[0];

  if (modelFile?.path) {
    const cloudinaryResponse = await uploadOnCloudinary(modelFile.path, {
      resource_type: "raw",
    });

    fs.unlink(modelFile.path, (err) => {
      if (err) console.error("Failed to remove temp model file:", err);
    });

    if (cloudinaryResponse) {
      uploadedModel3D = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    } else {
      console.error("Failed to upload 3D model:", modelFile.originalname || modelFile.name);
    }
  }
}


    // **✅ Create New Product in Database**
    const newProduct = await Product.create({
      productName,
      category,
      description,
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : undefined,
      stock: parseInt(stock, 10),
      dimensions,
      images: uploadedImages,
      modelFile: uploadedModel3D || null,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    
    // Clean up uploaded files in case of failure
    if (uploadedImages.length > 0 || uploadedModel3D) {
      console.log("Cleanup needed for failed product creation");
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
});

// Update product with image and 3D model management
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  // Authorization check
  if (
    req.user._id.toString() !== product.uploadedBy.toString() && 
    req.user.role !== "seller" 
  ) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: You cannot update this product"
    });
  }

  const {
    productName,
    category,
    description,
    price,
    discountedPrice,
    stock,
    dimensions,
  } = req.body;

  let updatedFields = {
    ...(productName && { productName }),
    ...(category && { category }),
    ...(description && { description }),
    ...(price && { price: parseFloat(price) }),
    ...(discountedPrice && { discountedPrice: parseFloat(discountedPrice) }),
    ...(stock && { stock: parseInt(stock, 10) }),
    ...(dimensions && { dimensions }),
  };

  let updatedImages = product.images;
  let updatedModel3D = product.modelFile;

  try {
    // Handle image updates if new files are uploaded
    if (req.files?.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      // Delete existing images from Cloudinary if we're replacing them
      if (product.images && product.images.length > 0) {
        await Promise.all(
          product.images.map((image) => cloudinary.uploader.destroy(image.public_id))
        );
      }

      // Upload new images
      updatedImages = [];
      for (const file of imageFiles) {
        const cloudinaryResponse = await uploadOnCloudinary(file.path);

        fs.unlink(file.path, (err) => {
          if (err) console.error("Failed to remove temp file:", err);
        });

        if (cloudinaryResponse) {
          updatedImages.push({
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          });
        } else {
          console.error("Failed to upload image:", file.originalname || file.name);
        }
      }
    }

    // Handle 3D model update if a new file is uploaded
    if (req.files?.model3D) {
      const modelFiles = Array.isArray(req.files.model3D)
        ? req.files.model3D
        : [req.files.model3D];

      const modelFile = modelFiles[0];

      // Delete existing model from Cloudinary if we're replacing it
      if (product.modelFile && product.modelFile.public_id) {
        await cloudinary.uploader.destroy(product.modelFile.public_id, {
          resource_type: "raw"
        });
      }

      // Upload new model
      if (modelFile?.path) {
        const cloudinaryResponse = await uploadOnCloudinary(modelFile.path, {
          resource_type: "raw",
        });

        fs.unlink(modelFile.path, (err) => {
          if (err) console.error("Failed to remove temp model file:", err);
        });

        if (cloudinaryResponse) {
          updatedModel3D = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          };
        } else {
          console.error("Failed to upload 3D model:", modelFile.originalname || modelFile.name);
        }
      }
    }

    // Update product with all changes
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...updatedFields,
        images: updatedImages,
        modelFile: updatedModel3D
      },
      { new: true, runValidators: true }
    ).populate("uploadedBy", "id");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    console.error("Product update error:", error);
    
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message
    });
  }
});

// Delete product with image and 3D model cleanup


export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  // Check if product exists
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Authorization: Only uploader or admin can delete
  if (
    req.user._id.toString() !== product.uploadedBy.toString() &&
    req.user.role !== "seller"
  ) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: You cannot delete this product",
    });
  }

  try {
    // Delete product images from Cloudinary
    if (product.images?.length > 0) {
      await Promise.all(
        product.images.map(async (img) => {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        })
      );
    }

    // Delete 3D model file from Cloudinary (if exists)
    if (product.modelFile?.public_id) {
      await cloudinary.uploader.destroy(product.modelFile.public_id, {
        resource_type: "raw",
      });
    }

    // Delete product from database
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
});


// Advanced search with filters
export const searchProducts = asyncHandler(async (req, res) => {
  const { query, category, minPrice, maxPrice, sellerId } = req.query;

  const searchFilter = {
    $and: [
      {
        $or: [
          { productName: { $regex: query || "", $options: "i" } },
          { description: { $regex: query || "", $options: "i" } }
        ]
      }
    ]
  };

  // Filter by category
  if (category) searchFilter.$and.push({ category });

  // Filter by price range
  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    searchFilter.$and.push({ price: priceFilter });
  }

  // ✅ Filter by seller ID
  if (sellerId) {
    searchFilter.$and.push({ uploadedBy: sellerId });
  }

  const products = await Product.find(searchFilter)
    .populate("uploadedBy", "name email")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

// Get products by category with filtering
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { minPrice, maxPrice, sortBy = "createdAt", order = "desc" } = req.query;

  const filter = { category };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(filter)
    .populate("uploadedBy", "name email")
    .sort({ [sortBy]: order === "asc" ? 1 : -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});




















{/*
export const createProduct = asyncHandler(async (req, res) => {
  const {
    productName,
    category,
    description,
    price,
    discountedPrice,
    stock,
    dimensions,
  } = req.body;

  // Validation for required fields
  if (!productName || !category || !price || !stock) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  let uploadedImages = [];
  let uploadedModel3D = null;

  try {
    // **✅ Handling Images Upload**
    if (req.files?.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of imageFiles) {
        const cloudinaryResponse = await uploadOnCloudinary(file.path);

        fs.unlink(file.path, (err) => {
          if (err) console.error("Failed to remove temp file:", err);
        });

        if (cloudinaryResponse) {
          uploadedImages.push({
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          });
        } else {
          console.error("Failed to upload image:", file.originalname || file.name);
        }
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

   
    if (req.files?.model3D) {
  // Ensure modelFiles is always an array
  const modelFiles = Array.isArray(req.files.model3D)
    ? req.files.model3D
    : [req.files.model3D];

  // Process the first model file (or loop through all if needed)
  const modelFile = modelFiles[0];

  if (modelFile?.path) {
    const cloudinaryResponse = await uploadOnCloudinary(modelFile.path, {
      resource_type: "raw",
    });

    fs.unlink(modelFile.path, (err) => {
      if (err) console.error("Failed to remove temp model file:", err);
    });

    if (cloudinaryResponse) {
      uploadedModel3D = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    } else {
      console.error("Failed to upload 3D model:", modelFile.originalname || modelFile.name);
    }
  }
}


    // **✅ Create New Product in Database**
    const newProduct = await Product.create({
      productName,
      category,
      description,
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : undefined,
      stock: parseInt(stock, 10),
      dimensions,
      images: uploadedImages,
      modelFile: uploadedModel3D || null,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    
    // Clean up uploaded files in case of failure
    if (uploadedImages.length > 0 || uploadedModel3D) {
      console.log("Cleanup needed for failed product creation");
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
}); */}