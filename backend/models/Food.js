import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
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
    name: {
      type: String,
      required: [true, 'Please enter food name'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Please select category'],
      default: 'Cooked Meals'
    },
    image: {
      type: String,
      required: [true, 'Please provide food image']
    },
    dietary: {
      type: String,
      enum: ['Veg', 'Non-Veg'],
      default: 'Veg'
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify available quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 1
    },
    unit: {
      type: String,
      default: 'portions'
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative']
    },
    preparedTime: {
      type: Date,
      required: [true, 'Please specify preparation time'],
      default: Date.now
    },
    bestBeforeTime: {
      type: Date,
      required: [true, 'Please specify expiry time']
    },
    pickupLocation: {
      type: String,
      default: 'Hotel Main Gate / Front Desk'
    },
    availablePickupTime: {
      type: String,
      default: 'Immediate Pickup Available'
    },
    status: {
      type: String,
      enum: ['Available', 'Ordered', 'Collected', 'Expired'],
      default: 'Available'
    },
    distanceKm: {
      type: Number,
      default: 2.5
    },
    coordinates: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Dynamic check: whether item has expired based on current server time
foodSchema.methods.checkExpiry = function () {
  const now = new Date();
  if (this.status !== 'Collected' && this.bestBeforeTime && new Date(this.bestBeforeTime) <= now) {
    this.status = 'Expired';
    return true;
  }
  return false;
};

// Text indexes for search
foodSchema.index({ name: 'text', hotelName: 'text', hotelLocation: 'text' });
foodSchema.index({ status: 1, bestBeforeTime: 1, category: 1, price: 1 });

export const Food = mongoose.model('Food', foodSchema, 'fooditems');
export const FoodItem = Food;
