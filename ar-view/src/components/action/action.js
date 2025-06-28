// action.js

// Define addToCart action
export const addToCart = (product) => {
    return {
      type: 'ADD_TO_CART',
      payload: product
    };
  };
  
  // Define addToWishlist action
  export const addToWishlist = (product) => {
    return {
      type: 'ADD_TO_WISHLIST',
      payload: product
    };
  };
  
  // Define addItemToCompare action
  export const addItemToCompare = (product) => {
    return {
      type: 'ADD_TO_COMPARE',
      payload: product
    };
  };
  