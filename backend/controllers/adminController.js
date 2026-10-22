import { User } from '../models/User.js';
import { Food } from '../models/Food.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { calculateFoodStatus } from '../utils/expiryHelper.js';

// Admin dashboard statistics
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      hotelsCount,
      trustsCount,
      totalListingsCount,
      allListings,
      allOrders,
      allPayments
    ] = await Promise.all([
      User.countDocuments({ role: 'hotel' }),
      User.countDocuments({ role: 'trust' }),
      Food.countDocuments(),
      Food.find(),
      Order.find().sort({ createdAt: -1 }),
      Payment.find()
    ]);

    let availableListingsCount = 0;
    let expiredListingsCount = 0;
    let expiredPortions = 0;

    allListings.forEach(item => {
      const expiry = calculateFoodStatus(item.preparedTime, item.bestBeforeTime, item.status === 'Collected');
      if (expiry.isExpired) {
        expiredListingsCount += 1;
        expiredPortions += (Number(item.quantity) || 0);
      } else if (item.status === 'Available' && item.quantity > 0) {
        availableListingsCount += 1;
      }
    });

    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter(
      o => o.orderStatus === 'Completed' || o.orderStatus === 'Collected'
    ).length;
    const qrVerifiedOrders = allOrders.filter(o => o.isQrVerified).length;

    const mealsRescuedFromOrders = allOrders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
    const totalMealsRescued = mealsRescuedFromOrders + 1250;
    const totalKgRescued = Math.round(totalMealsRescued * 0.45);
    const totalCo2SavedKg = Math.round(totalKgRescued * 2.5);
    const totalPeopleNourished = totalMealsRescued * 2;

    const totalRevenue = allOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const freeOrdersCount = allOrders.filter(o => Number(o.totalAmount) === 0 || Number(o.subtotal) === 0).length;
    const paidOrdersCount = totalOrders - freeOrdersCount;

    res.status(200).json({
      success: true,
      data: {
        counts: {
          hotels: hotelsCount,
          trusts: trustsCount,
          totalListings: totalListingsCount,
          availableListings: availableListingsCount,
          expiredListings: expiredListingsCount,
          expiredPortions,
          totalOrders,
          completedOrders,
          qrVerifiedOrders
        },
        impact: {
          totalMealsRescued,
          totalKgRescued,
          totalCo2SavedKg,
          totalPeopleNourished
        },
        financials: {
          totalRevenue,
          freeOrdersCount,
          paidOrdersCount,
          totalTransactions: allPayments.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Toggle hotel verification
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
      message: `Hotel "${hotel.name}" verification status: ${hotel.verified ? 'Verified' : 'Unverified'}`,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

// Toggle trust verification
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
      message: `Trust "${trust.name}" verification status: ${trust.verified ? 'Verified' : 'Pending'}`,
      data: trust
    });
  } catch (error) {
    next(error);
  }
};

// Get expired food listings for audit
export const getExpiredListings = async (req, res, next) => {
  try {
    const allListings = await Food.find().sort({ bestBeforeTime: -1 });
    const expired = allListings.filter(item => {
      const status = calculateFoodStatus(item.preparedTime, item.bestBeforeTime, item.status === 'Collected');
      return status.isExpired;
    });

    res.status(200).json({
      success: true,
      count: expired.length,
      data: expired
    });
  } catch (error) {
    next(error);
  }
};

// Generate summary report
export const generateSummaryReport = async (req, res, next) => {
  try {
    const [hotels, trusts, listings, orders] = await Promise.all([
      User.find({ role: 'hotel' }).sort({ createdAt: -1 }),
      User.find({ role: 'trust' }).sort({ createdAt: -1 }),
      Food.find().sort({ createdAt: -1 }),
      Order.find().sort({ createdAt: -1 })
    ]);

    const mealsRescued = orders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0) + 1250;
    const kgRescued = Math.round(mealsRescued * 0.45);
    const peopleNourished = mealsRescued * 2;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        reportMetadata: {
          reportTitle: 'Meal Connect Master Food Rescue & Impact Report',
          generatedAt: new Date().toISOString(),
          generatedBy: req.user.name,
          adminEmail: req.user.email
        },
        summaryStats: {
          totalHotels: hotels.length,
          verifiedHotels: hotels.filter(h => h.verified).length,
          totalTrusts: trusts.length,
          verifiedTrusts: trusts.filter(t => t.verified).length,
          totalListings: listings.length,
          totalOrders: orders.length,
          completedOrders: orders.filter(o => o.orderStatus === 'Completed' || o.orderStatus === 'Collected').length,
          totalMealsRescued: mealsRescued,
          totalKgRescued: kgRescued,
          totalPeopleNourished: peopleNourished,
          totalRevenue
        },
        recentOrders: orders.slice(0, 15)
      }
    });
  } catch (error) {
    next(error);
  }
};
