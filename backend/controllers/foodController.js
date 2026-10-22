import { Food } from '../models/Food.js';
import { Notification } from '../models/Notification.js';
import { calculateFoodStatus } from '../utils/expiryHelper.js';

const formatListingWithExpiry = (item) => {
  const itemObj = item.toObject ? item.toObject() : item;
  const expiry = calculateFoodStatus(
    itemObj.preparedTime,
    itemObj.bestBeforeTime,
    itemObj.status === 'Collected'
  );

  return {
    ...itemObj,
    id: itemObj._id.toString(),
    hotelId: itemObj.hotel ? itemObj.hotel.toString() : '',
    isExpired: expiry.isExpired,
    isExpiringSoon: expiry.isExpiringSoon,
    expiryBadgeColor: expiry.badgeColor,
    timeLeftFormatted: expiry.timeLeftFormatted,
    status: expiry.isExpired && itemObj.status !== 'Collected' ? 'Expired' : itemObj.status
  };
};

// Get food listings
export const getFoodListings = async (req, res, next) => {
  try {
    const { search, category, dietary, priceFilter, maxDistance, sortBy } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (dietary && dietary !== 'all') {
      query.dietary = dietary === 'Non-Veg' ? 'Non-Veg' : 'Veg';
    }

    if (priceFilter === 'free') {
      query.price = 0;
    } else if (priceFilter === 'paid') {
      query.price = { $gt: 0 };
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { hotelName: { $regex: s, $options: 'i' } },
        { hotelLocation: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } }
      ];
    }

    let items = await Food.find(query).sort({ createdAt: -1 });
    let formatted = items.map(formatListingWithExpiry);

    if (maxDistance) {
      const maxDist = parseFloat(maxDistance);
      if (!isNaN(maxDist)) {
        formatted = formatted.filter(item => (item.distanceKm || 2.5) <= maxDist);
      }
    }

    if (sortBy === 'expiring') {
      formatted.sort((a, b) => new Date(a.bestBeforeTime).getTime() - new Date(b.bestBeforeTime).getTime());
    } else if (sortBy === 'nearest') {
      formatted.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    } else if (sortBy === 'lowest_price') {
      formatted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'highest_qty') {
      formatted.sort((a, b) => b.quantity - a.quantity);
    }

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Single food item
export const getFoodItemById = async (req, res, next) => {
  try {
    const item = await Food.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    res.status(200).json({
      success: true,
      data: formatListingWithExpiry(item)
    });
  } catch (error) {
    next(error);
  }
};

// Hotel listings
export const getMyHotelFoodListings = async (req, res, next) => {
  try {
    const items = await Food.find({ hotel: req.user._id }).sort({ createdAt: -1 });
    const formatted = items.map(formatListingWithExpiry);

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Create food item
export const createFoodItem = async (req, res, next) => {
  try {
    const {
      name,
      category,
      image,
      description,
      quantity,
      unit,
      price,
      preparedTime,
      bestBeforeTime,
      pickupLocation,
      availablePickupTime,
      dietary
    } = req.body;

    if (!name || !image || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide food name, image, and available quantity.'
      });
    }

    const hotel = req.user;
    const prep = preparedTime ? new Date(preparedTime) : new Date();
    const exp = bestBeforeTime ? new Date(bestBeforeTime) : new Date(prep.getTime() + 4 * 3600 * 1000);

    const newFood = await Food.create({
      hotel: hotel._id,
      hotelName: hotel.name,
      hotelLocation: hotel.location || hotel.address || 'Bengaluru',
      name: name.trim(),
      category: category || 'Cooked Meals',
      image,
      description: description || `Fresh surplus ${name.trim()} prepared safely.`,
      quantity: Number(quantity),
      unit: unit || 'portions',
      price: price ? Math.max(0, Number(price)) : 0,
      preparedTime: prep,
      bestBeforeTime: exp,
      pickupLocation: pickupLocation || hotel.address || hotel.location || 'Hotel Main Gate',
      availablePickupTime: availablePickupTime || 'Immediate Pickup Available',
      dietary: dietary === 'Non-Veg' ? 'Non-Veg' : 'Veg',
      status: 'Available',
      distanceKm: (Math.random() * 3 + 1).toFixed(1),
      coordinates: hotel.coordinates || { lat: 12.9716, lng: 77.5946 }
    });

    await Notification.create({
      roleTarget: 'Trust',
      title: '🍲 New Food Available',
      message: `${hotel.name} posted ${newFood.quantity} ${newFood.unit} of ${newFood.name}!`,
      type: 'new_food'
    });

    res.status(201).json({
      success: true,
      message: 'Food listing created successfully!',
      data: formatListingWithExpiry(newFood)
    });
  } catch (error) {
    next(error);
  }
};

// Update food item
export const updateFoodItem = async (req, res, next) => {
  try {
    const item = await Food.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Food listing not found' });
    }

    const isOwner = item.hotel.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You can only update food items listed by your own hotel.'
      });
    }

    const {
      name,
      category,
      image,
      description,
      quantity,
      unit,
      price,
      preparedTime,
      bestBeforeTime,
      pickupLocation,
      availablePickupTime,
      dietary,
      status
    } = req.body;

    if (name) item.name = name.trim();
    if (category) item.category = category;
    if (image) item.image = image;
    if (description !== undefined) item.description = description;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit) item.unit = unit;
    if (price !== undefined) item.price = Math.max(0, Number(price));
    if (preparedTime) item.preparedTime = new Date(preparedTime);
    if (bestBeforeTime) item.bestBeforeTime = new Date(bestBeforeTime);
    if (pickupLocation) item.pickupLocation = pickupLocation;
    if (availablePickupTime) item.availablePickupTime = availablePickupTime;
    if (dietary) item.dietary = dietary === 'Non-Veg' ? 'Non-Veg' : 'Veg';
    if (status) item.status = status;

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully!',
      data: formatListingWithExpiry(item)
    });
  } catch (error) {
    next(error);
  }
};

// Delete food item
export const deleteFoodItem = async (req, res, next) => {
  try {
    const item = await Food.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    const isOwner = item.hotel.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You can only delete food items listed by your own hotel.'
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
