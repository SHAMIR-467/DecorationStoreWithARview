import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
} from "../controllers/productController.js";
import { verifyJWT, isSeller } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
const router = express.Router();

// ✅ Public Routes
router.get("/products",  getAllProducts);
router.get("/product/:id",  getProductById);
router.get("/products/search", searchProducts);
router.get("/products/category/:categoryId", getProductsByCategory);

// ✅ Protected Routes (Only Sellers/Admins)
router.post(
  "/product", 
  upload.fields([{ name: "images", maxCount: 5 }, { name: "model3D", maxCount: 1 }]), 
  verifyJWT, 
  isSeller, 
  createProduct
);
router.put(
  "/product/:id", 
  upload.fields([
    {
      name: "images", maxCount: 5,
      name : "modelFile", maxCount: 1
     }, // Also allow image updates
  ]),
   
  isSeller, 
  updateProduct
);
router.delete("/product/:id", verifyJWT, isSeller, deleteProduct);

export default router;
