import mongoose from 'mongoose';

const orderDetailSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
   hasFeedback: {
    type: Boolean,
    default: false
  },
});

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema);

export default OrderDetail;