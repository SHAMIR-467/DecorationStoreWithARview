import mongoose from "mongoose";
const productSchema = mongoose.Schema(
  {
    productName: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountedPrice: { type: Number },
    stock: { type: Number, required: true },
    dimensions: { type: String },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    modelFile: { public_id: String, url: String }
  ,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
