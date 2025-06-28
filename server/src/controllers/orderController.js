import Order from '../models/Order.js';
import OrderDetail from '../models/OrderDetail.js';
import Product from '../models/Product.js';

// User Controllers
export const createOrder = async (req, res) => {
  try {
    const { 
      items, 
      totalAmount, 
      paymentMethod, 
      shippingDetails 
    } = req.body;
    
    // Validate required fields
    if (!items || items.length === 0 || !totalAmount || !paymentMethod || !shippingDetails) {
      return res.status(400).json({ message: 'Missing required order information' });
    }

    // Create the order
    const order = new Order({
      user: req.user._id, // Assuming user is attached from auth middleware
      totalAmount,
      paymentMethod,
      shippingDetails,
      notifications: [{
        message: 'Order has been placed successfully',
      }]
    });

    const savedOrder = await order.save();

    // Create order details for each item
    const orderDetailsPromises = items.map(async (item) => {
      // Verify product exists and has sufficient stock
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.productName}`);
      }

      // Update product stock
      product.stock -= item.quantity;
      await product.save();

      // Create order detail
      const orderDetail = new OrderDetail({
        order: savedOrder._id,
        product: item.productId,
        quantity: item.quantity,
        price: item.price || product.price
      });

      return orderDetail.save();
    });

    await Promise.all(orderDetailsPromises);

    // Notify seller about the new order
    const sellerNotification = {
      message: `New order received with ID: ${savedOrder._id}`,
      date: new Date()
    };

    // Find all products' sellers and notify them
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    const sellerIds = [...new Set(products.map(p => p.uploadedBy.toString()))];
    
    // This would be handled by a notification service in a real application
    // For now, we'll just log it
    console.log(`Notifying sellers: ${sellerIds} about order ${savedOrder._id}`);
    
    // You could implement email notifications here
    // sendNotificationEmail(sellerIds, `New order received: ${savedOrder._id}`);

    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    // Return orders directly as an array to match frontend expectations
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('user', 'name email');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the authenticated user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    const orderDetails = await OrderDetail.find({ order: orderId })
      .populate('product', 'productName images price');
    
    res.status(200).json({ order, orderDetails });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Failed to fetch order details', error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the authenticated user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to cancel this order' });
    }
    
    // Only allow cancellation if order is still in Pending or Processing state
    if (order.status !== 'Pending' && order.status !== 'Processing') {
      return res.status(400).json({ 
        message: 'Cannot cancel order that has been shipped or delivered' 
      });
    }
    
    // Update order status
    order.status = 'Cancelled';
    order.notifications.push({
      message: 'Order has been cancelled',
      date: new Date()
    });
    
    await order.save();
    
    // Restore product stock
    const orderDetails = await OrderDetail.find({ order: orderId });
    
    const stockUpdatePromises = orderDetails.map(async (detail) => {
      const product = await Product.findById(detail.product);
      if (product) {
        product.stock += detail.quantity;
        return product.save();
      }
      return Promise.resolve();
    });
    
    await Promise.all(stockUpdatePromises);
    
    // Notify seller about the cancellation
    // sendNotificationEmail(sellerIds, `Order ${orderId} has been cancelled`);
    
    res.status(200).json({ 
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
};

// Admin/Seller Controllers
export const getSellerOrders = async (req, res) => {
  try {
    // Check if the user is a seller or admin
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    let orders = [];
    
    if (req.user.role === 'admin'|| req.user.role === 'seller') {
      // Admin can see all orders
      orders = await Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Find all products owned by this seller
      const sellerProducts = await Product.find({ uploadedBy: req.user._id });
      const sellerProductIds = sellerProducts.map(product => product._id);
      
      // Find all order details containing the seller's products
      const orderDetails = await OrderDetail.find({ 
        product: { $in: sellerProductIds } 
      });
      
      // Extract unique order IDs
      const orderIds = [...new Set(orderDetails.map(detail => detail.order))];
      
      // Find all these orders with their details
      orders = await Order.find({ _id: { $in: orderIds } })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    }
    
    // Return orders directly as an array to match frontend expectations
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ message: 'Failed to fetch seller orders', error: error.message });
  }
};

export const getSellerOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Verify the order exists
    const order = await Order.findById(orderId)
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If admin, they can access any order
    if (req.user.role === 'admin'|| req.user.role === 'seller') {
      const orderDetails = await OrderDetail.find({ order: orderId })
        .populate('product', 'productName images price uploadedBy');
      
      return res.status(200).json({ 
        order,
        orderDetails
      });
    }
    
    // For sellers, check if they have any products in this order
    const sellerProducts = await Product.find({ uploadedBy: req.user._id });
    const sellerProductIds = sellerProducts.map(product => product._id.toString());
    
    // Find all order details for this order
    const allOrderDetails = await OrderDetail.find({ order: orderId })
      .populate('product', 'productName images price uploadedBy');
    
    // Filter to only include the seller's products - with safeguards
    const sellerOrderDetails = allOrderDetails.filter(detail => 
      detail.product && 
      detail.product.uploadedBy && 
      sellerProductIds.includes(detail.product.uploadedBy.toString())
    );
    
    if (sellerOrderDetails.length === 0) {
      return res.status(403).json({ message: 'No products in this order belong to you' });
    }
    
    res.status(200).json({ 
      order,
      orderDetails: sellerOrderDetails
    });
  } catch (error) {
    console.error('Get seller order details error:', error);
    res.status(500).json({ message: 'Failed to fetch order details', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingInfo } = req.body;
    
    if (!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    
    // Admin can update any order
    if (req.user.role === 'admin'|| req.user.role === 'seller') {
      // Update order status
      order.status = status;
      if (trackingInfo !== undefined) {
        order.trackingInfo = trackingInfo;
      }
      
      // Add notification
      order.notifications.push({
        message: `Order status updated to ${status}`,
        date: new Date()
      });
      
      await order.save();
      
      return res.status(200).json({ 
        message: 'Order status updated successfully',
        order
      });
    }
    
    // For sellers, verify they have products in this order
    const sellerProducts = await Product.find({ uploadedBy: req.user._id });
    const sellerProductIds = sellerProducts.map(product => product._id);
    
    const orderDetails = await OrderDetail.find({ order: orderId });
    
    // Check if any product in this order belongs to the seller
    const hasSellerProducts = orderDetails.some(detail => 
      detail.product && sellerProductIds.includes(detail.product.toString())
    );
    
    if (!hasSellerProducts) {
      return res.status(403).json({ 
        message: 'Unauthorized to update this order'
      });
    }
    
    // Update order status
    order.status = status;
    if (trackingInfo !== undefined) {
      order.trackingInfo = trackingInfo;
    }
    
    // Add notification
    order.notifications.push({
      message: `Order status updated to ${status}`,
      date: new Date()
    });
    
    await order.save();
    
    // Notify customer about the status update
    // sendNotificationEmail(order.user.email, `Your order status has been updated to ${status}`);
    
    res.status(200).json({ 
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    // This should only be accessible by admin
    if (req.user.role !== 'admin'|| req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    // Return orders directly as an array to match frontend expectations
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};