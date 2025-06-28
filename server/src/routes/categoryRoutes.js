import express from "express";
import upload from "../middleware/multer.middleware.js";
import { createCategory, editCategory, deleteCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 }, // Maximum of 10 images
    { name: "threeDObject", maxCount: 1 }, // Only one 3D object file
  ]),
  createCategory
);

router.put("/:id", editCategory); // Update category
router.delete("/:id", deleteCategory); // Delete category

export default router;
