import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'meal_connect_jwt_super_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new Hotel / Restaurant
// @route   POST /api/auth/register-hotel
// @access  Public
export const registerHotel = async (req, res, next) => {
  try {
    const { name, email, password, ownerName, phone, location, address } = req.body;

    if (!name || !email || !password || !phone || (!location && !address)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required hotel fields: name, email, password, phone, and location.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.'
      });
    }

    const hotel = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      ownerName: ownerName ? ownerName.trim() : name.trim(),
      phone: phone.trim(),
      location: (location || address || '').trim(),
      address: (address || location || '').trim(),
      role: 'hotel',
      verified: true,
      rating: 5.0,
      totalRescuedKg: 0,
      avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80'
    });

    const token = generateToken(hotel._id, hotel.role);

    res.status(201).json({
      success: true,
      message: `Hotel registered successfully! Welcome, ${hotel.name}`,
      token,
      user: {
        id: hotel._id,
        _id: hotel._id,
        name: hotel.name,
        email: hotel.email,
        role: hotel.role,
        phone: hotel.phone,
        location: hotel.location,
        address: hotel.address,
        ownerName: hotel.ownerName,
        verified: hotel.verified,
        rating: hotel.rating,
        totalRescuedKg: hotel.totalRescuedKg,
        avatar: hotel.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hotel Login
// @route   POST /api/auth/login-hotel
// @access  Public
export const loginHotel = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both hotel email address and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail, role: 'hotel' }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid hotel email or password. Please verify credentials or register.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Logged in as Hotel: ${user.name}`,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        address: user.address,
        ownerName: user.ownerName,
        verified: user.verified,
        rating: user.rating,
        totalRescuedKg: user.totalRescuedKg,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new Trust / NGO
// @route   POST /api/auth/register-trust
// @access  Public
export const registerTrust = async (req, res, next) => {
  try {
    const { name, email, password, phone, location, address } = req.body;

    if (!name || !email || !password || !phone || (!location && !address)) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required Trust / NGO registration fields.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.'
      });
    }

    const trust = await User.create({
      name: name.trim(),
      headPerson: name.trim(),
      email: cleanEmail,
      password,
      phone: phone.trim(),
      location: (location || address || '').trim(),
      address: (address || location || '').trim(),
      regDetails: `REG/${new Date().getFullYear()}/NGO/${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'trust',
      verified: true,
      peopleServed: 0,
      avatar: 'https://images.unsplash.com/photo-1532629345422-7515fe9d1632?w=150&auto=format&fit=crop&q=80'
    });

    const token = generateToken(trust._id, trust.role);

    res.status(201).json({
      success: true,
      message: `Trust / NGO registered successfully! Welcome, ${trust.name}`,
      token,
      user: {
        id: trust._id,
        _id: trust._id,
        name: trust.name,
        email: trust.email,
        role: trust.role,
        phone: trust.phone,
        location: trust.location,
        address: trust.address,
        headPerson: trust.headPerson,
        regDetails: trust.regDetails,
        verified: trust.verified,
        peopleServed: trust.peopleServed,
        avatar: trust.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trust / NGO Login
// @route   POST /api/auth/login-trust
// @access  Public
export const loginTrust = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both Trust / NGO email address and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail, role: 'trust' }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Trust / NGO email or password. Please verify credentials or register.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Logged in as Trust / NGO: ${user.name}`,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        address: user.address,
        headPerson: user.headPerson,
        regDetails: user.regDetails,
        verified: user.verified,
        peopleServed: user.peopleServed,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Login (No public admin registration endpoint!)
// @route   POST /api/auth/login-admin
// @access  Public
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both Admin email address and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail, role: 'admin' }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Admin credentials. Authorized personnel only.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in as Master Administrator',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessLevel: user.accessLevel || 'SuperAdmin'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        address: user.address,
        ownerName: user.ownerName,
        headPerson: user.headPerson,
        regDetails: user.regDetails,
        verified: user.verified,
        rating: user.rating,
        totalRescuedKg: user.totalRescuedKg,
        peopleServed: user.peopleServed,
        avatar: user.avatar,
        accessLevel: user.accessLevel
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hotels
// @route   GET /api/auth/hotels
// @access  Public / Private
export const getAllHotels = async (req, res, next) => {
  try {
    const hotels = await User.find({ role: 'hotel' }).sort({ createdAt: -1 });
    const formatted = hotels.map(h => ({
      id: h._id.toString(),
      _id: h._id.toString(),
      name: h.name,
      ownerName: h.ownerName,
      email: h.email,
      phone: h.phone,
      address: h.address || h.location,
      location: h.location || h.address,
      coordinates: h.coordinates,
      verified: h.verified,
      rating: h.rating,
      totalRescuedKg: h.totalRescuedKg,
      avatar: h.avatar
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all trusts
// @route   GET /api/auth/trusts
// @access  Public / Private
export const getAllTrusts = async (req, res, next) => {
  try {
    const trusts = await User.find({ role: 'trust' }).sort({ createdAt: -1 });
    const formatted = trusts.map(t => ({
      id: t._id.toString(),
      _id: t._id.toString(),
      name: t.name,
      headPerson: t.headPerson,
      email: t.email,
      phone: t.phone,
      regDetails: t.regDetails,
      address: t.address || t.location,
      location: t.location || t.address,
      coordinates: t.coordinates,
      verified: t.verified,
      peopleServed: t.peopleServed,
      avatar: t.avatar
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin toggle hotel verification
// @route   PUT /api/auth/hotels/:id/verify
// @access  Private (Admin only)
export const toggleHotelVerification = async (req, res, next) => {
  try {
    const hotel = await User.findOne({ _id: req.params.id, role: 'hotel' });
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    hotel.verified = !hotel.verified;
    await hotel.save();

    res.status(200).json({
      success: true,
      message: `Hotel "${hotel.name}" verification status updated to ${hotel.verified ? 'Verified' : 'Unverified'}`,
      data: {
        id: hotel._id,
        name: hotel.name,
        verified: hotel.verified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin toggle trust verification
// @route   PUT /api/auth/trusts/:id/verify
// @access  Private (Admin only)
export const toggleTrustVerification = async (req, res, next) => {
  try {
    const trust = await User.findOne({ _id: req.params.id, role: 'trust' });
    if (!trust) {
      return res.status(404).json({ success: false, error: 'Trust not found' });
    }

    trust.verified = !trust.verified;
    await trust.save();

    res.status(200).json({
      success: true,
      message: `Trust "${trust.name}" verification status updated to ${trust.verified ? 'Verified' : 'Pending'}`,
      data: {
        id: trust._id,
        name: trust.name,
        verified: trust.verified
      }
    });
  } catch (error) {
    next(error);
  }
};
