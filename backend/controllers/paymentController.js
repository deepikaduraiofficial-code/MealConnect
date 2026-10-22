import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Food } from '../models/Food.js';
import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keyId && keySecret && keyId !== 'your_razorpay_key_id' && keyId !== 'YOUR_RAZORPAY_KEY_ID') {
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return null;
};

// Create payment order (Mock Simulation or live Razorpay)
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { foodId, quantity = 1, fulfillmentType = 'pickup', simulateOutcome = 'success' } = req.body;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    const orderQty = parseInt(quantity, 10) || 1;
    const subtotal = (Number(food.price) || 0) * orderQty;
    const deliveryCharge = fulfillmentType === 'delivery' ? 45 : 0;
    const totalAmount = subtotal + deliveryCharge;

    // Free food claim
    if (totalAmount === 0) {
      return res.status(200).json({
        success: true,
        isFree: true,
        amount: 0,
        currency: 'INR',
        message: 'Free donation claim. No payment gateway charge required.'
      });
    }

    const razorpay = getRazorpayInstance();

    // Live Gateway if configured
    if (razorpay) {
      const options = {
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`
      };
      const rzpOrder = await razorpay.orders.create(options);
      return res.status(200).json({
        success: true,
        isFree: false,
        isMockSimulation: false,
        gateway: 'Razorpay',
        keyId: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: rzpOrder.id,
        amount: totalAmount,
        currency: 'INR'
      });
    }

    // Mock Payment Simulation for College Mini Project
    const testOrderId = `SIM_ORDER_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const secret = process.env.JWT_SECRET || 'mock_payment_simulation_key';
    const simulationToken = crypto
      .createHmac('sha256', secret)
      .update(`${testOrderId}|${totalAmount}|${simulateOutcome}`)
      .digest('hex');

    return res.status(200).json({
      success: true,
      isFree: false,
      isMockSimulation: true,
      simulationNotice: 'College Project Demonstration: Mock payment simulation active. No real credit card, bank account, or funds are debited.',
      testOrderId,
      simulationToken,
      amount: totalAmount,
      currency: 'INR',
      supportedOutcomes: ['success', 'failed', 'pending'],
      selectedOutcome: simulateOutcome
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment signature / simulation outcome
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      testOrderId,
      simulationToken,
      amount,
      simulateOutcome = 'success'
    } = req.body;

    const razorpay = getRazorpayInstance();

    if (razorpay && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
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
        isMockSimulation: false,
        transactionId: razorpayPaymentId,
        message: 'Payment signature verified successfully.'
      });
    }

    // Mock Payment verification
    if (testOrderId && simulationToken) {
      if (simulateOutcome === 'failed') {
        return res.status(400).json({
          success: false,
          verified: false,
          isMockSimulation: true,
          error: 'Simulated Payment Error: Transaction declined by issuing bank (Mock Failure Simulation).'
        });
      }

      if (simulateOutcome === 'pending') {
        return res.status(202).json({
          success: true,
          verified: false,
          status: 'Pending',
          isMockSimulation: true,
          message: 'Simulated Payment: Transaction is currently pending authorization.'
        });
      }

      const generatedTxnId = `TXN-SIM-${Date.now()}`;
      return res.status(200).json({
        success: true,
        verified: true,
        isMockSimulation: true,
        transactionId: generatedTxnId,
        message: 'Simulated Payment Verified: Safe prototype payment processed successfully.'
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

// Payment history & receipts
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
