import { createSlice } from '@reduxjs/toolkit';

// Initial state of the cart, including items, total quantity, and total price
const initialState = {
  items: [],        // Array to store cart items
  totalQuantity: 0, // Total number of items in the cart
  totalPrice: 0,    // Total price of all items in the cart
};

// Creating the cart slice with reducers for adding, removing, incrementing, and decrementing item quantities
const cartSlice = createSlice({
  name: 'cart',        // Name of the slice
  initialState,        // Initial state of the cart
  reducers: {
    // Action to add an item to the cart
    addToCart: (state, action) => {
      // Check if the item already exists in the cart
      const existingItem = state.items.find(item => item.id === action.payload.id);

      if (existingItem) {
        // If the item exists, increase its quantity and total price
        existingItem.quantity += 1;
        existingItem.totalPrice += existingItem.price;
      } else {
        // If the item doesn't exist, add it to the cart with an initial quantity of 1
        state.items.push({
          ...action.payload,
          quantity: 1,
          totalPrice: action.payload.price,
        });
      }

      // Update the total quantity and total price of the cart
      state.totalQuantity += 1;
      state.totalPrice += action.payload.price;
    },

    // Action to remove an item from the cart
    removeFromCart: (state, action) => {
      // Find the index of the item to be removed
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      
      if (itemIndex !== -1) {
        // Update the total quantity and price by subtracting the item's quantity and total price
        state.totalQuantity -= state.items[itemIndex].quantity;
        state.totalPrice -= state.items[itemIndex].totalPrice;
        
        // Remove the item from the cart
        state.items.splice(itemIndex, 1);
      }
    },

    // Action to increment the quantity of an item in the cart
    incrementQuantity: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload);
      
      if (existingItem) {
        // Increase the item's quantity and total price
        existingItem.quantity += 1;
        existingItem.totalPrice += existingItem.price;
        
        // Update the total quantity and total price of the cart
        state.totalQuantity += 1;
        state.totalPrice += existingItem.price;
      }
    },

    // Action to decrement the quantity of an item in the cart
    decrementQuantity: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload);
      
      if (existingItem) {
        if (existingItem.quantity > 1) {
          // Decrease the item's quantity and total price if more than one exists
          existingItem.quantity -= 1;
          existingItem.totalPrice -= existingItem.price;
          
          // Update the total quantity and total price of the cart
          state.totalQuantity -= 1;
          state.totalPrice -= existingItem.price;
        } else {
          // If only one item is left, remove it from the cart
          state.totalQuantity -= 1;
          state.totalPrice -= existingItem.price;
          state.items = state.items.filter(item => item.id !== action.payload);
        }
      }
    },

    // Action to clear the entire cart
    clearCart: (state) => {
      state.items = [];        // Empty the cart items
      state.totalQuantity = 0; // Reset total quantity
      state.totalPrice = 0;    // Reset total price
    }
  }
});

// Exporting the actions to be used in components
export const { addToCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart } = cartSlice.actions;

// Exporting the reducer to be used in the store
export default cartSlice.reducer;
