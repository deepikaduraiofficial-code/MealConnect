import QRCode from 'qrcode';
import { Order } from '../models/Order.js';
import { FoodItem } from '../models/FoodItem.js';
import { Cart } from '../models/Cart.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { calculateFoodStatus } from '../utils/expiryHelper.js';

// Helper to generate unique order ID
const generateUniqueOrderId = async () => {
  let orderId;
  let exists = true;
  while (exists) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    orderId = `ORD-2026-${randomDigits}`;
    const found = await Order.findOne({ orderId });
    if (!found) exists = false;
  }
  return orderId;
};

// Helper to generate pickup PIN
const generatePickupPin = (orderId) => {
  const digits = orderId.replace(/\D/g, '').slice(-4);
  return `MC-${digits.padStart(4, '0')}`;
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Trust or authenticated user)
export const createOrder = async (req, res, next) => {
  try {
    const { foodId, quantity = 1, fulfillmentType = 'pickup', paymentMethod = 'UPI', paymentTxnId, notes } = req.body;

    if (!foodId) {
      return res.status(400).json({ success: false, error: 'Please provide foodId' });
    }

    const orderQty = parseInt(quantity, 10) || 1;
    if (orderQty <= 0) {
      return res.status(400).json({ success: false, error: 'Order quantity must be at least 1' });
    }

    // 1. Fetch Food Item
    const food = await FoodItem.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    // 2. Validate Expiry based on current server time
    const expiry = calculateFoodStatus(food.preparedTime, food.bestBeforeTime, food.status === 'Collected');
    if (expiry.isExpired) {
      return res.status(400).json({
        success: false,
        error: '⚠️ This food item has expired and cannot be ordered.'
      });
    }

    // 3. Validate Stock
    if (food.quantity < orderQty) {
      return res.status(400).json({
        success: false,
        error: `Insufficient quantity available. Only ${food.quantity} ${food.unit} remaining.`
      });
    }

    // 4. Server-side price and fee calculation (never trust client prices!)
    const pricePerUnit = Number(food.price) || 0;
    const subtotal = pricePerUnit * orderQty;
    const deliveryCharge = fulfillmentType === 'delivery' ? 45 : 0;
    const totalAmount = subtotal + deliveryCharge;

    // 5. Generate unique Order ID & Pickup PIN
    const orderId = await generateUniqueOrderId();
    const pickupCode = generatePickupPin(orderId);
    const txnId = paymentTxnId || `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const trustUser = req.user;

    // 6. Generate QR Code payload and Data URL
    const qrPayload = JSON.stringify({
      orderId,
      pickupCode,
      foodName: food.name,
      quantity: `${orderQty} ${food.unit}`,
      hotelName: food.hotelName,
      trustName: trustUser.name
    });

    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        margin: 1,
        width: 256,
        color: {
          dark: '#059669',
          light: '#ffffff'
        }
      });
    } catch (qrErr) {
      console.warn('QR Code generation fallback:', qrErr.message);
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 7. Create Order document
    const newOrder = await Order.create({
      orderId,
      trust: trustUser._id,
      trustName: trustUser.name,
      hotel: food.hotel,
      hotelName: food.hotelName,
      hotelLocation: food.hotelLocation,
      pickupLocation: food.pickupLocation || food.hotelLocation,
      foodItem: food._id,
      foodName: food.name,
      foodImage: food.image,
      quantity: orderQty,
      unit: food.unit,
      pricePerUnit,
      subtotal,
      deliveryCharge,
      totalAmount,
      fulfillmentType,
      paymentMethod,
      paymentTxnId: txnId,
      paymentStatus: 'Payment Successful',
      orderStatus: 'Food Ready',
      orderDate: now,
      estimatedDelivery: 'Ready for Pickup / Verification',
      notes: notes || '',
      pickupCode,
      qrCodeDataUrl,
      isQrVerified: false,
      pickupVerification: null,
      timeline: [
        { status: 'Order Placed', time: timeString, done: true },
        { status: 'Hotel Confirmed', time: timeString, done: true },
        { status: 'Food Ready', time: timeString, done: true },
        { status: 'Picked Up', time: 'Pending', done: false },
        { status: 'Delivered', time: 'Pending', done: false },
        { status: 'Completed', time: 'Pending', done: false }
      ]
    });

    // 8. Deduct food stock
    const remainingStock = Math.max(0, food.quantity - orderQty);
    food.quantity = remainingStock;
    if (remainingStock === 0) {
      food.status = 'Ordered';
    }
    await food.save();

    // 9. Clean up cart if this item was in the user's cart
    await Cart.findOneAndUpdate(
      { user: trustUser._id },
      { $pull: { items: { foodItem: food._id } } }
    );

    // 10. Record Payment transaction
    await Payment.create({
      order: newOrder._id,
      orderId: newOrder.orderId,
      user: trustUser._id,
      amount: totalAmount,
      paymentMethod,
      transactionId: txnId,
      status: 'Completed',
      isTestMode: true,
      verifiedAt: now
    });

    // 11. Notifications
    await Notification.create([
      {
        roleTarget: 'Hotel',
        hotelId: food.hotel.toString(),
        title: '🔔 New Order Received (Pickup QR Ready)',
        message: `${trustUser.name} ordered ${orderQty} ${food.unit} of ${food.name} (Code: ${pickupCode})`,
        type: 'order'
      },
      {
        roleTarget: 'Trust',
        trustId: trustUser._id.toString(),
        title: '✅ Order Placed & Pickup QR Code Generated',
        message: `Order ${orderId} confirmed. Show your Pickup QR Pass (${pickupCode}) at ${food.hotelName} upon collection.`,
        type: 'order'
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created and payment recorded successfully',
      data: newOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for the current user (Hotel, Trust, or Admin)
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'hotel') {
      query = { hotel: req.user._id };
    } else if (req.user.role === 'trust') {
      query = { trust: req.user._id };
    }
    // Admin sees all orders (query = {})

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by orderId or Mongo _id
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;
    let order = await Order.findOne({ orderId: id });
    if (!order && id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Authorization check: Hotel owner, Trust owner, or Admin
    const isHotel = order.hotel.toString() === req.user._id.toString();
    const isTrust = order.trust.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isHotel && !isTrust && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permission to view this order.'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status in lifecycle
// @route   PUT /api/orders/:id/status
// @access  Private (Hotel or Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status: newStatus } = req.body;
    const id = req.params.id;

    if (!newStatus) {
      return res.status(400).json({ success: false, error: 'Please provide status' });
    }

    let order = await Order.findOne({ orderId: id });
    if (!order && id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const isHotel = order.hotel.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isHotel && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Only the donating hotel or an admin can update order status.'
      });
    }

    const statuses = ['Order Placed', 'Hotel Confirmed', 'Food Ready', 'Picked Up', 'Delivered', 'Completed', 'Collected'];
    const nextIndex = statuses.indexOf(newStatus);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    order.orderStatus = newStatus;
    if (order.timeline && order.timeline.length > 0 && nextIndex !== -1) {
      order.timeline.forEach((step, idx) => {
        if (idx <= nextIndex) {
          step.done = true;
          if (step.time === 'Pending') {
            step.time = nowTime;
          }
        }
      });
    }

    await order.save();

    // Notify Trust of status advance
    await Notification.create({
      roleTarget: 'Trust',
      trustId: order.trust.toString(),
      title: `📦 Order Status: ${newStatus}`,
      message: `Order ${order.orderId} is now marked as "${newStatus}".`,
      type: 'status'
    });

    res.status(200).json({
      success: true,
      message: `Order ${order.orderId} status updated to ${newStatus}`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify food pickup via QR Code scan or Pickup PIN
// @route   POST /api/orders/verify-pickup
// @access  Private (Hotel or Admin)
export const verifyPickup = async (req, res, next) => {
  try {
    const { orderIdOrPin } = req.body;
    const hotelUser = req.user;

    const cleanInput = (orderIdOrPin || '').trim().toUpperCase();
    if (!cleanInput) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid Order ID or Pickup PIN.'
      });
    }

    // Search by orderId or pickupCode
    const order = await Order.findOne({
      $or: [
        { orderId: cleanInput },
        { pickupCode: cleanInput }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `No food order found matching "${cleanInput}". Please double check the QR code or PIN.`
      });
    }

    // Authorization check
    const isOwnerHotel = order.hotel.toString() === hotelUser._id.toString() || order.hotelName === hotelUser.name;
    const isSuperAdmin = hotelUser.role === 'admin';

    if (!isOwnerHotel && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: `Authorization Restricted: Order ${order.orderId} belongs to "${order.hotelName}". You are signed in as "${hotelUser.name}". Only the donating hotel can verify pickup.`
      });
    }

    // Prevent duplicate verification
    if (order.isQrVerified || order.orderStatus === 'Collected' || order.orderStatus === 'Completed') {
      const verifiedAt = order.pickupVerification
        ? `${order.pickupVerification.pickupDate} at ${order.pickupVerification.pickupTime}`
        : 'previously';
      return res.status(400).json({
        success: false,
        error: `Duplicate Verification Prevented: Order ${order.orderId} was already collected and verified on ${verifiedAt}. This QR code has expired.`
      });
    }

    const now = new Date();
    const dayStr = String(now.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${dayStr} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const pickupRecord = {
      pickupDate: formattedDate,
      pickupTime: formattedTime,
      orderId: order.orderId,
      hotelName: order.hotelName,
      trustName: order.trustName,
      foodItem: order.foodName,
      collectedQuantity: `${order.quantity} ${order.unit || 'portions'}`,
      verifiedBy: hotelUser.name || 'Hotel Front Desk'
    };

    // Update order
    order.orderStatus = 'Collected';
    order.isQrVerified = true;
    order.pickupVerification = pickupRecord;

    if (order.timeline && order.timeline.length > 0) {
      order.timeline.forEach(step => {
        if (step.status === 'Picked Up' || step.status === 'Delivered' || step.status === 'Completed') {
          step.done = true;
          if (step.time === 'Pending') {
            step.time = formattedTime;
          }
        }
      });
    }

    await order.save();

    // Notify Trust
    await Notification.create({
      roleTarget: 'Trust',
      trustId: order.trust.toString(),
      title: '🎉 Food Pickup Verified & Handed Over',
      message: `${order.hotelName} successfully verified QR code for order ${order.orderId}. ${order.quantity} ${order.unit} of ${order.foodName} handed over to ${order.trustName}.`,
      type: 'order'
    });

    res.status(200).json({
      success: true,
      message: `✓ QR Pickup Verified! Order ${order.orderId} marked as Collected.`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
