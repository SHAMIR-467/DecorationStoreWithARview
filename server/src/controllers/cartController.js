
// controllers/cartController.js
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Get cart items
export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const cartItems = await Cart.find({ user: userId })
            .populate('product', 'name price image description');
        
        let totalPrice = 0;
        let totalQuantity = 0;
        
        const items = cartItems.map(item => {
            const itemTotal = item.product.price * item.quantity;
            totalPrice += itemTotal;
            totalQuantity += item.quantity;
            
            return {
                id: item._id,
                product: item.product,
                quantity: item.quantity,
                totalPrice: itemTotal
            };
        });
        
        res.status(200).json({
            success: true,
            count: items.length,
            totalQuantity,
            totalPrice,
            data: items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Add to cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;
        
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        // Check if item already in cart
        let cartItem = await Cart.findOne({ user: userId, product: productId });
        
        if (cartItem) {
            // Update quantity if item exists
            cartItem.quantity += parseInt(quantity);
            await cartItem.save();
        } else {
            // Create new cart item
            cartItem = await Cart.create({
                user: userId,
                product: productId,
                quantity: parseInt(quantity)
            });
        }
        
        res.status(200).json({
            success: true,
            data: cartItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Update cart item quantity
export const updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { quantity } = req.body;
        
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Quantity must be at least 1'
            });
        }
        
        const cartItem = await Cart.findOne({ 
            user: userId,
            product: productId
        });
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                error: 'Cart item not found'
            });
        }
        
        cartItem.quantity = parseInt(quantity);
        await cartItem.save();
        
        res.status(200).json({
            success: true,
            data: cartItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        
        const result = await Cart.findOneAndDelete({
            user: userId,
            product: productId
        });
        
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Cart item not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Clear cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await Cart.deleteMany({ user: userId });
        
        res.status(200).json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};