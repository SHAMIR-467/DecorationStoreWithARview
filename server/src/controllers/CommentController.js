import Comment from '../models/CommentModel.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';

/**
 * Get all comments for a specific product
 */
export const getProductComments = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate product exists
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      throw new ApiError(
        'Product not found',
        StatusCodes.NOT_FOUND
      );
    }
    
    // Find all comments for the product and sort by most recent
    const comments = await Comment.find({ productId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Get user details for each comment
    const commentsWithUserDetails = await Promise.all(
      comments.map(async (comment) => {
        const user = await User.findById(comment.userId)
          .select('firstName lastName username avatar')
          .lean();
        
        return {
          ...comment,
          user: user || { username: 'Anonymous' }
        };
      })
    );
    
    return res.status(StatusCodes.OK).json({
      success: true,
      count: commentsWithUserDetails.length,
      comments: commentsWithUserDetails
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching product comments',
      error: error.message
    });
  }
};

/**
 * Create a new comment for a product
 */
export const createComment = async (req, res) => {
  try {
    const { productId } = req.params;
    const { text, rating } = req.body;
    const userId = req.user.id; // Assumes auth middleware sets req.user
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(
        'Product not found',
        StatusCodes.NOT_FOUND
      );
    }
    
    // Create comment
    const comment = await Comment.create({
      text,
      rating,
      productId,
      userId
    });
    
    // Fetch user info to return with comment
    const user = await User.findById(userId)
      .select('firstName lastName username avatar')
      .lean();
    
    const commentWithUser = {
      ...comment.toObject(),
      user
    };
    
    return res.status(StatusCodes.CREATED).json({
      success: true,
      comment: commentWithUser
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
};

/**
 * Update a comment (only the owner can update)
 */
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text, rating } = req.body;
    const userId = req.user.id; // Assumes auth middleware sets req.user
    
    // Find comment
    const comment = await Comment.findById(commentId);
    
    // Check if comment exists
    if (!comment) {
      throw new ApiError(
        'Comment not found',
        StatusCodes.NOT_FOUND
      );
    }
    
    // Check if user is owner
    if (comment.userId.toString() !== userId) {
      throw new ApiError(
        'Not authorized to update this comment',
        StatusCodes.UNAUTHORIZED
      );
    }
    
    // Update comment
    comment.text = text || comment.text;
    if (rating) comment.rating = rating;
    
    await comment.save();
    
    // Fetch user info to return with updated comment
    const user = await User.findById(userId)
      .select('firstName lastName username avatar')
      .lean();
    
    const updatedComment = {
      ...comment.toObject(),
      user
    };
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error updating comment',
      error: error.message
    });
  }
};

/**
 * Delete a comment (only the owner or admin can delete)
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id; // Assumes auth middleware sets req.user
    const isAdmin = req.user.role === 'seller'; // Assumes role is part of user object
    
    // Find comment
    const comment = await Comment.findById(commentId);
    
    // Check if comment exists
    if (!comment) {
      throw new ApiError(
        'Comment not found',
        StatusCodes.NOT_FOUND
      );
    }
    
    // Check if user is owner or admin
    if (comment.userId.toString() !== userId && !isAdmin) {
      throw new ApiError(
        'Not authorized to delete this comment',
        StatusCodes.UNAUTHORIZED
      );
    }
    
    await comment.deleteOne();
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};