// redux/slices/wishlistSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalPrice: 0, // Track total price of items in the wishlist
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Add an item to the wishlist
    addToWishlist: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (!existingItem) {
        state.items.push(action.payload);
        state.totalPrice += action.payload.price; // Update total price
      }
    },
    
    // Remove an item from the wishlist
    removeFromWishlist: (state, action) => {
      const itemToRemove = state.items.find(item => item.id === action.payload);
      if (itemToRemove) {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalPrice -= itemToRemove.price; // Update total price
      }
    },
    
    // Clear all items from the wishlist
    clearWishlist: (state) => {
      state.items = [];
      state.totalPrice = 0; // Reset total price
    },
    
    // Move all items to the cart (used in the wishlist page for moving all to cart)
    moveAllToCart: (state, action) => {
      action.payload.cartItems.push(...state.items); // Move items to cart
      state.items = []; // Clear wishlist
      state.totalPrice = 0; // Reset total price
    },
    
    // Check if an item is in the wishlist
    isItemInWishlist: (state, action) => {
      return state.items.some(item => item.id === action.payload.id);
    },
    
    // Get all items in the wishlist
    getWishlistItems: (state) => {
      return state.items;
    },
    
    // Calculate the total price of the wishlist
    calculateTotalPrice: (state) => {
      state.totalPrice = state.items.reduce((acc, item) => acc + item.price, 0);
    },
  },
});

// Export actions
export const { 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist, 
  moveAllToCart, 
  isItemInWishlist, 
  getWishlistItems, 
  calculateTotalPrice 
} = wishlistSlice.actions;

// Export reducer
export default wishlistSlice.reducer;
