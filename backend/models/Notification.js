import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    roleTarget: {
      type: String,
      enum: ['Hotel', 'Trust', 'Admin', 'All'],
      default: 'All'
    },
    hotelId: {
      type: String,
      default: ''
    },
    trustId: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['order', 'new_food', 'status', 'expiry', 'general'],
      default: 'general'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.timestamp = ret.createdAt ? new Date(ret.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
        return ret;
      }
    }
  }
);

notificationSchema.index({ roleTarget: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
