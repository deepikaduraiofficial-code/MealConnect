import crypto from 'crypto';
import Razorpay from 'razorpay';
import { FoodItem } from '../models/FoodItem.js';
import { Payment } from '../models/Payment.js';

// Lazy initialize Razorpay client if credentials exist
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keyId && keySecret && keyId !== 'YOUR_RAZORPAY_KEY_ID') {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return null;
};

// @desc    Create payment order (Razorpay or Verified Test Mode)
// @route   POST /api/payments/create-order
// @access  Private
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { foodId, quantity = 1, fulfillmentType = 'pickup' } = req.body;

    const food = await FoodItem.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    const orderQty = parseInt(quantity, 10) || 1;
    const subtotal = (Number(food.price) || 0) * orderQty;
    const deliveryCharge = fulfillmentType === 'delivery' ? 45 : 0;
    const totalAmount = subtotal + deliveryCharge;

    // Free food order
    if (totalAmount === 0) {
      return res.status(200).json({
        success: true,
        isFree: true,
        amount: 0,
        currency: 'INR',
        message: 'Free donation order. No payment gateway charge required.'
      });
    }

    const razorpay = getRazorpayInstance();

    if (razorpay) {
      // Real Razorpay gateway order
      const options = {
        amount: Math.round(totalAmount * 100), // in paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`
      };

      const rzpOrder = await razorpay.orders.create(options);

      return res.status(200).json({
        success: true,
        isFree: false,
        testMode: false,
        gateway: 'Razorpay',
        keyId: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: rzpOrder.id,
        amount: totalAmount,
        currency: 'INR'
      });
    } else {
      // Test Mode with cryptographically signed test session token
      const testOrderId = `TEST_RZP_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const secret = process.env.JWT_SECRET || 'test_payment_secret';
      const testSignature = crypto
        .createHmac('sha256', secret)
        .update(`${testOrderId}|${totalAmount}`)
        .digest('hex');

      return res.status(200).json({
        success: true,
        isFree: false,
        testMode: true,
        gateway: 'TestGateway (Configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env for Live Gateway)',
        testOrderId,
        testToken: testSignature,
        amount: totalAmount,
        currency: 'INR',
        message: 'Test mode active. Safe test order generated.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      testOrderId,
      testToken,
      amount
    } = req.body;

    const razorpay = getRazorpayInstance();

    if (razorpay && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      // Live Razorpay HMAC verification
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({
          success: false,
          error: 'Payment verification failed: Invalid Razorpay cryptographic signature.'
        });
      }

      return res.status(200).json({
        success: true,
        verified: true,
        testMode: false,
        transactionId: razorpayPaymentId,
        message: 'Payment signature verified successfully.'
      });
    }

    // Test-mode verification
    if (testOrderId && testToken) {
      const secret = process.env.JWT_SECRET || 'test_payment_secret';
      const expectedToken = crypto
        .createHmac('sha256', secret)
        .update(`${testOrderId}|${amount}`)
        .digest('hex');

      if (expectedToken !== testToken) {
        return res.status(400).json({
          success: false,
          error: 'Test payment token mismatch. Verification rejected.'
        });
      }

      const generatedTxnId = `TXN-TEST-${Date.now()}`;
      return res.status(200).json({
        success: true,
        verified: true,
        testMode: true,
        transactionId: generatedTxnId,
        message: 'Test payment token validated successfully.'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Incomplete payment verification payload.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments
// @access  Private
export const getPaymentHistory = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};
