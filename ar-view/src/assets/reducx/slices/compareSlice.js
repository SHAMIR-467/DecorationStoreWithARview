// redux/slices/compareSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],  // Store compared products
  comparisonDetails: {},  // Store AI-generated comparison data
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    // Add an item to the comparison list
    addToCompare: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    // Remove an item from the comparison list
    removeFromCompare: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload.id);
    },
    // Clear all items from the comparison list
    clearCompare: (state) => {
      state.items = [];
      state.comparisonDetails = {};  // Clear AI comparison details
    },
    // Add AI-generated comparison details
    setComparisonDetails: (state, action) => {
      state.comparisonDetails = action.payload;
    },
  },
});

export const { 
  addToCompare, 
  removeFromCompare, 
  clearCompare, 
  setComparisonDetails 
} = compareSlice.actions;

export default compareSlice.reducer;
