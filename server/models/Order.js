import mongoose from 'mongoose';

const orderTimelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    time: { type: String, default: 'Pending' },
    done: { type: Boolean, default: false }
  },
  { _id: false }
);

const pickupVerificationSchema = new mongoose.Schema(
  {
    pickupDate: { type: String, required: true },
    pickupTime: { type: String, required: true },
    orderId: { type: String, required: true },
    hotelName: { type: String, required: true },
    trustName: { type: String, required: true },
    foodItem: { type: String, required: true },
    collectedQuantity: { type: String, required: true },
    verifiedBy: { type: String, default: 'Hotel Front Desk' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    trust: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    trustName: {
      type: String,
      required: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    hotelName: {
      type: String,
      required: true
    },
    hotelLocation: {
      type: String,
      default: ''
    },
    pickupLocation: {
      type: String,
      default: ''
    },
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true
    },
    foodName: {
      type: String,
      required: true
    },
    foodImage: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      default: 'portions'
    },
    pricePerUnit: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      default: 0
    },
    deliveryCharge: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    fulfillmentType: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup'
    },
    paymentMethod: {
      type: String,
      default: 'UPI'
    },
    paymentTxnId: {
      type: String,
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['Payment Successful', 'Pending', 'Failed'],
      default: 'Payment Successful'
    },
    orderStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Hotel Confirmed',
        'Food Ready',
        'Picked Up',
        'Delivered',
        'Collected',
        'Completed',
        'Cancelled'
      ],
      default: 'Food Ready'
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    estimatedDelivery: {
      type: String,
      default: 'Ready for Pickup / Verification'
    },
    notes: {
      type: String,
      default: ''
    },
    pickupCode: {
      type: String,
      default: ''
    },
    qrCodeDataUrl: {
      type: String,
      default: ''
    },
    isQrVerified: {
      type: Boolean,
      default: false
    },
    pickupVerification: {
      type: pickupVerificationSchema,
      default: null
    },
    timeline: [orderTimelineSchema]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret.orderId;
        return ret;
      }
    }
  }
);

// Indexes for query performance
orderSchema.index({ trust: 1, createdAt: -1 });
orderSchema.index({ hotel: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

export const Order = mongoose.model('Order', orderSchema);
