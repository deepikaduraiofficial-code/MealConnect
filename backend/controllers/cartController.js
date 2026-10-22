import { Cart } from '../models/Cart.js';
import { Food } from '../models/Food.js';
import { calculateFoodStatus } from '../utils/expiryHelper.js';

// Get cart
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.foodItem');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const validItems = [];
    for (const item of cart.items) {
      if (item.foodItem) {
        const expiry = calculateFoodStatus(
          item.foodItem.preparedTime,
          item.foodItem.bestBeforeTime,
          item.foodItem.status === 'Collected'
        );

        validItems.push({
          food: {
            id: item.foodItem._id.toString(),
            _id: item.foodItem._id.toString(),
            name: item.foodItem.name,
            category: item.foodItem.category,
            image: item.foodItem.image,
            price: item.foodItem.price,
            quantity: item.foodItem.quantity,
            unit: item.foodItem.unit,
            hotelId: item.foodItem.hotel ? item.foodItem.hotel.toString() : '',
            hotelName: item.foodItem.hotelName,
            hotelLocation: item.foodItem.hotelLocation,
            preparedTime: item.foodItem.preparedTime,
            bestBeforeTime: item.foodItem.bestBeforeTime,
            dietary: item.foodItem.dietary,
            isExpired: expiry.isExpired,
            isExpiringSoon: expiry.isExpiringSoon,
            timeLeftFormatted: expiry.timeLeftFormatted
          },
          quantity: item.quantity
        });
      }
    }

    res.status(200).json({
      success: true,
      count: validItems.length,
      data: validItems
    });
  } catch (error) {
    next(error);
  }
};

// Add to cart
export const addToCart = async (req, res, next) => {
  try {
    const { foodId, quantity = 1 } = req.body;
    if (!foodId) {
      return res.status(400).json({ success: false, error: 'Please provide foodId' });
    }

    const qty = parseInt(quantity, 10) || 1;
    if (qty <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    const expiry = calculateFoodStatus(food.preparedTime, food.bestBeforeTime, food.status === 'Collected');
    if (expiry.isExpired) {
      return res.status(400).json({
        success: false,
        error: 'Cannot add expired food to cart. This item is past its safety threshold.'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.foodItem.toString() === foodId.toString()
    );

    if (existingIndex > -1) {
      const newQty = Math.min(food.quantity, cart.items[existingIndex].quantity + qty);
      cart.items[existingIndex].quantity = newQty;
    } else {
      const addedQty = Math.min(food.quantity, qty);
      cart.items.push({ foodItem: food._id, quantity: addedQty });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: `Added ${food.name} to cart`,
      cartItemsCount: cart.items.length
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
export const updateCartQuantity = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    if (isNaN(qty) || qty <= 0) {
      cart.items = cart.items.filter(item => item.foodItem.toString() !== foodId.toString());
    } else {
      const existing = cart.items.find(item => item.foodItem.toString() === foodId.toString());
      if (existing) {
        existing.quantity = qty;
      }
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cartItemsCount: cart.items.length
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.foodItem.toString() !== foodId.toString());
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true });
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
