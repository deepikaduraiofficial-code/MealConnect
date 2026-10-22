import { User } from '../models/User.js';
import { FoodItem } from '../models/FoodItem.js';
import { Order } from '../models/Order.js';
import { Notification } from '../models/Notification.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[Seed] Database already contains ${userCount} users. Skipping full seed.`);
      return;
    }

    console.log('[Seed] Empty database detected. Seeding initial data...');

    // 1. Create Hotels
    const hotel1 = await User.create({
      name: 'Green Leaf Hotel',
      ownerName: 'Rajesh Sharma',
      email: 'contact@greenleafhotel.com',
      password: 'hotel123',
      phone: '+91 98765 43210',
      address: '45 MG Road, Near Metro Station',
      location: 'Indiranagar, Bengaluru',
      role: 'hotel',
      verified: true,
      rating: 4.8,
      totalRescuedKg: 340,
      avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9784, lng: 77.6408 }
    });

    const hotel2 = await User.create({
      name: 'Sri Annapoorna Restaurant',
      ownerName: 'Venkatesh Prasad',
      email: 'annapoorna@foodrescue.org',
      password: 'hotel123',
      phone: '+91 94432 112233',
      address: '128 10th Main, 4th Block',
      location: 'Jayanagar, Bengaluru',
      role: 'hotel',
      verified: true,
      rating: 4.9,
      totalRescuedKg: 520,
      avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9250, lng: 77.5938 }
    });

    const hotel3 = await User.create({
      name: 'City Grand Hotel',
      ownerName: 'Ananya Deshmukh',
      email: 'food@citygrand.com',
      password: 'hotel123',
      phone: '+91 98200 99887',
      address: '88 Ring Road Bypass',
      location: 'Koramangala, Bengaluru',
      role: 'hotel',
      verified: true,
      rating: 4.7,
      totalRescuedKg: 280,
      avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9352, lng: 77.6245 }
    });

    const hotel4 = await User.create({
      name: 'Hotel Royal Feast',
      ownerName: 'Vikram Malhotra',
      email: 'royal@feasthotels.in',
      password: 'hotel123',
      phone: '+91 97110 55443',
      address: '12 IT Park Boulevard',
      location: 'Whitefield, Bengaluru',
      role: 'hotel',
      verified: false,
      rating: 4.5,
      totalRescuedKg: 110,
      avatar: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9698, lng: 77.7499 }
    });

    const hotel5 = await User.create({
      name: 'Spice Garden Bistro',
      ownerName: 'Meera Nair',
      email: 'meera@spicegarden.in',
      password: 'hotel123',
      phone: '+91 99001 22334',
      address: '77 Old Airport Road',
      location: 'HAL, Bengaluru',
      role: 'hotel',
      verified: true,
      rating: 4.9,
      totalRescuedKg: 410,
      avatar: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9601, lng: 77.6486 }
    });

    // 2. Create Trusts / NGOs
    const trust1 = await User.create({
      name: 'Hope Foundation Trust',
      headPerson: 'Sister Maria Joseph',
      email: 'hope.trust@ngonetwork.org',
      password: 'trust123',
      phone: '+91 98450 12345',
      regDetails: 'REG/2018/NGO/9941 - 12A Certified',
      address: '14 Charity Lane, Richmond Town',
      location: 'Richmond Town, Bengaluru',
      role: 'trust',
      verified: true,
      peopleServed: 1450,
      avatar: 'https://images.unsplash.com/photo-1532629345422-7515fe9d1632?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9650, lng: 77.6000 }
    });

    const trust2 = await User.create({
      name: 'Akshaya Community Care',
      headPerson: 'Dr. Arvind Kumar',
      email: 'contact@akshayacare.org',
      password: 'trust123',
      phone: '+91 94480 67890',
      regDetails: 'NGO-KA-2020-00431 - 80G Tax Exempt',
      address: '89 Seva Marg, Ulsoor',
      location: 'Ulsoor, Bengaluru',
      role: 'trust',
      verified: true,
      peopleServed: 980,
      avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9817, lng: 77.6284 }
    });

    const trust3 = await User.create({
      name: 'Sneha Shelter Home',
      headPerson: 'Lakshmi Narayan',
      email: 'support@snehashelter.org',
      password: 'trust123',
      phone: '+91 97400 33221',
      regDetails: 'TRUST-BLR-2015-772',
      address: '22 Care Avenue, 8th Cross',
      location: 'Malleswaram, Bengaluru',
      role: 'trust',
      verified: true,
      peopleServed: 320,
      avatar: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 13.0031, lng: 77.5643 }
    });

    // 3. Create Admin
    const adminUser = await User.create({
      name: 'Master System Administrator',
      email: 'admin@foodrescue.org',
      password: 'admin123',
      phone: '+91 80 2345 6789',
      address: 'Meal Connect Central Command',
      location: 'Bengaluru HQ',
      role: 'admin',
      accessLevel: 'SuperAdmin',
      verified: true
    });

    // 4. Create Food Listings with active, valid timestamps
    const now = Date.now();
    const subHours = (h) => new Date(now - h * 3600 * 1000);
    const addHours = (h) => new Date(now + h * 3600 * 1000);

    const initialItems = [
      {
        hotel: hotel2._id,
        hotelName: hotel2.name,
        hotelLocation: hotel2.location,
        name: 'Steamed Idli & Hot Sambar',
        category: 'Breakfast',
        image: '/food-images/steamed_idli_hot_sambar.jpg',
        description: 'Fluffy white rice idlis served with hot drumstick sambar and coconut chutney. Sealed in food-grade trays.',
        quantity: 50,
        unit: 'portions',
        price: 10,
        preparedTime: subHours(1),
        bestBeforeTime: addHours(4.5),
        pickupLocation: 'Sri Annapoorna Service Desk',
        availablePickupTime: 'Available now',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 3.8
      },
      {
        hotel: hotel2._id,
        hotelName: hotel2.name,
        hotelLocation: hotel2.location,
        name: 'Sambar Idli',
        category: 'Breakfast',
        image: '/food-images/sambar_idli.jpg',
        description: 'Soft mini idlis floating in hot flavorful drumstick sambar with ghee and coriander.',
        quantity: 35,
        unit: 'portions',
        price: 15,
        preparedTime: subHours(1.5),
        bestBeforeTime: addHours(3.0),
        pickupLocation: 'Sri Annapoorna Main Counter',
        availablePickupTime: 'Immediate Pickup',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 3.8
      },
      {
        hotel: hotel1._id,
        hotelName: hotel1.name,
        hotelLocation: hotel1.location,
        name: 'Ven Pongal',
        category: 'Breakfast',
        image: '/food-images/ven_pongal.jpg',
        description: 'Traditional South Indian ghee rice and yellow moong dal cooked with cashews, black pepper, and cumin.',
        quantity: 30,
        unit: 'portions',
        price: 0, // Free donation!
        preparedTime: subHours(2),
        bestBeforeTime: addHours(2.5),
        pickupLocation: 'Green Leaf Hotel Breakfast Counter',
        availablePickupTime: 'Available Now',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 2.4
      },
      {
        hotel: hotel1._id,
        hotelName: hotel1.name,
        hotelLocation: hotel1.location,
        name: 'Vegetable Biryani & Salan',
        category: 'Lunch & Main Course',
        image: '/food-images/vegetable_biryani_salan.jpg',
        description: 'Fragrant basmati rice layered with fresh garden vegetables, mint, and whole spices. Served with Mirchi ka Salan.',
        quantity: 40,
        unit: 'portions',
        price: 0, // Free donation!
        preparedTime: subHours(1.5),
        bestBeforeTime: addHours(0.8), // Expiring soon for demo (approx 48 mins)
        pickupLocation: 'Green Leaf Hotel Service Gate',
        availablePickupTime: 'Immediate Pickup',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 2.4
      },
      {
        hotel: hotel3._id,
        hotelName: hotel3.name,
        hotelLocation: hotel3.location,
        name: 'Paneer Butter Masala & Naan',
        category: 'Cooked Meals',
        image: '/food-images/paneer_butter_masala_naan.jpg',
        description: 'Rich tomato-butter gravy with soft paneer cubes, accompanied by warm tandoori butter naan.',
        quantity: 25,
        unit: 'portions',
        price: 20,
        preparedTime: subHours(2),
        bestBeforeTime: addHours(3.5),
        pickupLocation: 'City Grand Hotel Banquet Entrance',
        availablePickupTime: 'Available Now',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 3.1
      },
      {
        hotel: hotel5._id,
        hotelName: hotel5.name,
        hotelLocation: hotel5.location,
        name: 'Chicken Biryani & Raita',
        category: 'Non-Vegetarian',
        image: '/food-images/chicken_biryani.jpg',
        description: 'Dum-cooked aromatic spiced chicken biryani with tender chicken pieces, caramelized onions, and cucumber raita.',
        quantity: 35,
        unit: 'portions',
        price: 25,
        preparedTime: subHours(1),
        bestBeforeTime: addHours(3.0),
        pickupLocation: 'Spice Garden Bistro Pickup Desk',
        availablePickupTime: 'Available Now',
        status: 'Available',
        dietary: 'Non-Veg',
        distanceKm: 4.2
      },
      {
        hotel: hotel1._id,
        hotelName: hotel1.name,
        hotelLocation: hotel1.location,
        name: 'South Indian Thali Meals',
        category: 'Cooked Meals',
        image: '/food-images/south_indian_meals.jpg',
        description: 'Complete wholesome meal packs: Sona Masoori rice, sambar, rasam, kootu, poriyal, and appalam.',
        quantity: 60,
        unit: 'portions',
        price: 0,
        preparedTime: subHours(1.2),
        bestBeforeTime: addHours(4.0),
        pickupLocation: 'Green Leaf Hotel Kitchen Entrance',
        availablePickupTime: 'Available Now',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 2.4
      },
      {
        hotel: hotel3._id,
        hotelName: hotel3.name,
        hotelLocation: hotel3.location,
        name: 'Assorted Bakery Breads & Muffins',
        category: 'Bakery',
        image: '/food-images/assorted_bakery_breads_muffins.jpg',
        description: 'Freshly baked artisanal whole wheat sandwich loaves, chocolate chip muffins, and butter croissants.',
        quantity: 45,
        unit: 'packs',
        price: 15,
        preparedTime: subHours(3),
        bestBeforeTime: addHours(18.0),
        pickupLocation: 'City Grand Bakery Counter',
        availablePickupTime: 'Available all day',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 3.1
      },
      {
        hotel: hotel2._id,
        hotelName: hotel2.name,
        hotelLocation: hotel2.location,
        name: 'Gulab Jamun & Payasam',
        category: 'Sweets & Desserts',
        image: '/food-images/gulab_jamun.jpg',
        description: 'Warm melt-in-mouth gulab jamuns in cardamom sugar syrup with semiya payasam.',
        quantity: 50,
        unit: 'cups',
        price: 10,
        preparedTime: subHours(2),
        bestBeforeTime: addHours(8.0),
        pickupLocation: 'Sri Annapoorna Sweet Section',
        availablePickupTime: 'Available Now',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 3.8
      }
    ];

    const createdFoodItems = await FoodItem.insertMany(initialItems);

    // 5. Seed Initial Orders
    const sampleOrder1 = await Order.create({
      orderId: 'ORD-2026-8801',
      trust: trust1._id,
      trustName: trust1.name,
      hotel: hotel1._id,
      hotelName: hotel1.name,
      hotelLocation: hotel1.location,
      pickupLocation: 'Green Leaf Hotel Service Gate',
      foodItem: createdFoodItems[3]._id,
      foodName: createdFoodItems[3].name,
      foodImage: createdFoodItems[3].image,
      quantity: 20,
      unit: 'portions',
      pricePerUnit: 0,
      subtotal: 0,
      deliveryCharge: 45,
      totalAmount: 45,
      fulfillmentType: 'delivery',
      paymentMethod: 'UPI',
      paymentTxnId: 'TXN-9981245781',
      paymentStatus: 'Payment Successful',
      orderStatus: 'Food Ready',
      orderDate: new Date(now - 45 * 60 * 1000),
      pickupCode: 'MC-8801',
      isQrVerified: false,
      timeline: [
        { status: 'Order Placed', time: '11:30 AM', done: true },
        { status: 'Hotel Confirmed', time: '11:35 AM', done: true },
        { status: 'Food Ready', time: '11:45 AM', done: true },
        { status: 'Picked Up', time: 'Pending', done: false },
        { status: 'Delivered', time: 'Pending', done: false },
        { status: 'Completed', time: 'Pending', done: false }
      ]
    });

    const sampleOrder2 = await Order.create({
      orderId: 'ORD-2026-8794',
      trust: trust2._id,
      trustName: trust2.name,
      hotel: hotel2._id,
      hotelName: hotel2.name,
      hotelLocation: hotel2.location,
      pickupLocation: 'Sri Annapoorna Service Desk',
      foodItem: createdFoodItems[0]._id,
      foodName: createdFoodItems[0].name,
      foodImage: createdFoodItems[0].image,
      quantity: 30,
      unit: 'portions',
      pricePerUnit: 10,
      subtotal: 300,
      deliveryCharge: 0,
      totalAmount: 300,
      fulfillmentType: 'pickup',
      paymentMethod: 'UPI',
      paymentTxnId: 'TXN-8874129033',
      paymentStatus: 'Payment Successful',
      orderStatus: 'Collected',
      orderDate: new Date(now - 180 * 60 * 1000),
      pickupCode: 'MC-8794',
      isQrVerified: true,
      pickupVerification: {
        pickupDate: '22 Oct 2026',
        pickupTime: '10:15 AM',
        orderId: 'ORD-2026-8794',
        hotelName: hotel2.name,
        trustName: trust2.name,
        foodItem: createdFoodItems[0].name,
        collectedQuantity: '30 portions',
        verifiedBy: 'Sri Annapoorna Front Desk'
      },
      timeline: [
        { status: 'Order Placed', time: '09:30 AM', done: true },
        { status: 'Hotel Confirmed', time: '09:35 AM', done: true },
        { status: 'Food Ready', time: '09:45 AM', done: true },
        { status: 'Picked Up', time: '10:15 AM', done: true },
        { status: 'Delivered', time: '10:15 AM', done: true },
        { status: 'Completed', time: '10:15 AM', done: true }
      ]
    });

    // 6. Seed Notifications
    await Notification.insertMany([
      {
        roleTarget: 'Hotel',
        hotelId: hotel1._id.toString(),
        title: '🔔 New Order Received (Pickup QR Ready)',
        message: 'Hope Foundation Trust placed an order for 20 portions of Vegetable Biryani & Salan (Code: MC-8801).',
        type: 'order',
        read: false
      },
      {
        roleTarget: 'Trust',
        trustId: trust1._id.toString(),
        title: '✅ Order Placed & Pickup QR Code Generated',
        message: 'Order ORD-2026-8801 confirmed. Show your Pickup QR Pass (MC-8801) at Green Leaf Hotel upon collection.',
        type: 'order',
        read: false
      },
      {
        roleTarget: 'Trust',
        title: '🍲 New Food Available',
        message: 'Sri Annapoorna Restaurant posted 50 portions of Steamed Idli & Hot Sambar!',
        type: 'new_food',
        read: false
      },
      {
        roleTarget: 'Admin',
        title: '🛡️ Hotel Verification Request',
        message: 'Hotel Royal Feast has registered and is pending verification review.',
        type: 'status',
        read: false
      }
    ]);

    console.log('[Seed] Database successfully seeded with Hotels, Trusts, Admin, Food Items, Orders, and Notifications.');
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
  }
};
