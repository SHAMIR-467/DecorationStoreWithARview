import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    // For populating user details
    user: {
      type: Object,
      default: null,
    }
  },
  { timestamps: true }
);

// Index for faster queries by productId
CommentSchema.index({ productId: 1 });

// Virtual for checking if comment is edited
CommentSchema.virtual('isEdited').get(function() {
  return this.updatedAt > this.createdAt;
});

// Method to format comment for response
CommentSchema.methods.toResponse = function() {
  return {
    id: this._id,
    text: this.text,
    rating: this.rating,
    productId: this.productId,
    user: this.user,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isEdited: this.isEdited
  };
};

export default mongoose.model('Comment', CommentSchema);