import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['hotel', 'trust', 'admin'],
      default: 'trust'
    },
    name: {
      type: String,
      required: [true, 'Please provide organization or account name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    coordinates: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 }
    },
    ownerName: {
      type: String,
      trim: true,
      default: ''
    },
    headPerson: {
      type: String,
      trim: true,
      default: ''
    },
    regDetails: {
      type: String,
      trim: true,
      default: ''
    },
    verified: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 4.8
    },
    totalRescuedKg: {
      type: Number,
      default: 0
    },
    peopleServed: {
      type: Number,
      default: 0
    },
    avatar: {
      type: String,
      default: ''
    },
    accessLevel: {
      type: String,
      default: 'Standard'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
