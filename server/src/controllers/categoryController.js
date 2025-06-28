import Category from "../models/category.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const categoryData = req.body;

  // Upload images and 3D object file
  const imageFiles = req.files["images"];
  const threeDObjectFile = req.files["threeDObject"]?.[0];

  const imageUrls = await uploadOnCloudinary(imageFiles || []);
  const threeDObjectUrl = threeDObjectFile ? await uploadOnCloudinary([threeDObjectFile]) : null;

  categoryData.images = imageUrls;
  if (threeDObjectUrl) categoryData.threeDObject = threeDObjectUrl[0];

  const category = await Category.create(categoryData);
  res.status(201).json(new ApiResponse(201, category, "Category created successfully."));
});

// Edit a category (specific fields)
const editCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  const category = await Category.findByIdAndUpdate(id, updatedData, { new: true });
  if (!category) throw new ApiError(404, "Category not found.");

  res.status(200).json(new ApiResponse(200, category, "Category updated successfully."));
});

// Delete a category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new ApiError(404, "Category not found.");

  res.status(200).json(new ApiResponse(200, null, "Category deleted successfully."));
});

export { createCategory, editCategory, deleteCategory };
