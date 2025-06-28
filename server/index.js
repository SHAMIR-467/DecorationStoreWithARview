import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import { errorHandler, notFound } from "./src/middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import orderRoutes from "./src/routes/orderRoutes.js"; // Import order routes
import chatRoutes from "./src/routes/chatRoutes.js"; // Import chat routes
import wishlistRoutes from "./src/routes/wishlistRoutes.js"; // Import wishlist routes
import contactRoutes from './src/routes/contactRoutes.js'; // Import contact routes  
import commentRoutes from './src/routes/CommentRoutes.js'; // Import comment routes           
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration remains the same
const allowedOrigins = process.env.CORS_ORIGIN.split(",");
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
///////////


// Database connection remains unchanged
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection failed:", err));

// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', commentRoutes);

//==========message error =====//
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message });
});



app.use(notFound);
app.use(errorHandler);

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:5000');
});
{/*
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
});*/}