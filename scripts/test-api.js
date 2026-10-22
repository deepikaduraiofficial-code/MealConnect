// Automated Verification & API Testing Script for Meal Connect Backend

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

const log = (msg, success = true) => {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${msg}`);
};

async function runTests() {
  console.log('\n======================================================');
  console.log('   MEAL CONNECT BACKEND API AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      log(`PASS: ${title}`, true);
      passed++;
    } else {
      log(`FAIL: ${title} - ${details}`, false);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('--- 1. Testing System Health Check ---');
    const healthRes = await fetch(`${BASE_URL}/health`).then(r => r.json());
    assert(healthRes.status === 'online', 'Health endpoint reports online', JSON.stringify(healthRes));

    // 2. Hotel Login
    console.log('\n--- 2. Testing Hotel Authentication ---');
    const hotelLoginRes = await fetch(`${BASE_URL}/auth/login-hotel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'contact@greenleafhotel.com',
        password: 'hotel123'
      })
    }).then(r => r.json());

    assert(hotelLoginRes.success === true && !!hotelLoginRes.token, 'Hotel login successful and returned JWT token');
    const hotelToken = hotelLoginRes.token;

    // 3. Trust Login
    console.log('\n--- 3. Testing Trust / NGO Authentication ---');
    const trustLoginRes = await fetch(`${BASE_URL}/auth/login-trust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hope.trust@ngonetwork.org',
        password: 'trust123'
      })
    }).then(r => r.json());

    assert(trustLoginRes.success === true && !!trustLoginRes.token, 'Trust login successful and returned JWT token');
    const trustToken = trustLoginRes.token;

    // 4. Admin Login
    console.log('\n--- 4. Testing Admin Authentication ---');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@foodrescue.org',
        password: 'admin123'
      })
    }).then(r => r.json());

    assert(adminLoginRes.success === true && adminLoginRes.user.role === 'admin', 'Admin login successful with admin role');
    const adminToken = adminLoginRes.token;

    // 5. Public Food Listings
    console.log('\n--- 5. Testing Food Marketplace & Filtering ---');
    const foodListingsRes = await fetch(`${BASE_URL}/food`).then(r => r.json());
    assert(foodListingsRes.success === true && foodListingsRes.data.length > 0, `Retrieved ${foodListingsRes.count} active food listings`);

    const sampleFood = foodListingsRes.data[0];
    assert(sampleFood && sampleFood.name && sampleFood.timeLeftFormatted, `Food item has dynamic expiry status: ${sampleFood?.timeLeftFormatted}`);

    // Filter test
    const breakfastRes = await fetch(`${BASE_URL}/food?category=Breakfast`).then(r => r.json());
    assert(breakfastRes.success === true && breakfastRes.data.every(f => f.category === 'Breakfast'), 'Category filter (Breakfast) operates correctly');

    // 6. Hotel Food Creation
    console.log('\n--- 6. Testing Hotel Food Item Creation ---');
    const newFoodRes = await fetch(`${BASE_URL}/food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hotelToken}`
      },
      body: JSON.stringify({
        name: 'Freshly Baked Dinner Rolls & Soup',
        category: 'Cooked Meals',
        image: '/food-images/sweet_corn_soup.jpg',
        description: 'Hot vegetable sweet corn soup with 2 freshly baked whole wheat rolls.',
        quantity: 20,
        unit: 'portions',
        price: 15,
        dietary: 'Veg',
        pickupLocation: 'Green Leaf Main Desk'
      })
    }).then(r => r.json());

    assert(newFoodRes.success === true && !!newFoodRes.data._id, 'Hotel created new food listing successfully');
    const createdFoodId = newFoodRes.data?._id;

    // 7. Cart Operations
    console.log('\n--- 7. Testing Cart Operations ---');
    const addToCartRes = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trustToken}`
      },
      body: JSON.stringify({
        foodId: createdFoodId,
        quantity: 2
      })
    }).then(r => r.json());

    assert(addToCartRes.success === true, 'Added food item to trust user cart');

    const getCartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${trustToken}` }
    }).then(r => r.json());

    assert(getCartRes.success === true && getCartRes.data.length > 0, `Cart retrieved with ${getCartRes.count} items`);

    // 8. Order Placement & Server-side Total Calculation
    console.log('\n--- 8. Testing Order Placement & Stock Deduction ---');
    const placeOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trustToken}`
      },
      body: JSON.stringify({
        foodId: createdFoodId,
        quantity: 5,
        fulfillmentType: 'pickup',
        paymentMethod: 'UPI',
        notes: 'Testing order placement flow'
      })
    }).then(r => r.json());

    assert(placeOrderRes.success === true && !!placeOrderRes.data.orderId, `Order placed successfully with ID: ${placeOrderRes.data?.orderId}`);
    const createdOrderId = placeOrderRes.data?.orderId;
    const pickupPin = placeOrderRes.data?.pickupCode;

    assert(!!pickupPin && pickupPin.startsWith('MC-'), `Pickup PIN generated properly: ${pickupPin}`);

    // Check remaining quantity
    const updatedFood = await fetch(`${BASE_URL}/food/${createdFoodId}`).then(r => r.json());
    assert(updatedFood.data.quantity === 15, `Food stock accurately deducted: 20 - 5 = ${updatedFood.data.quantity}`);

    // 9. Hotel QR Code / PIN Pickup Verification
    console.log('\n--- 9. Testing Hotel QR Code & PIN Pickup Verification ---');
    const verifyPickupRes = await fetch(`${BASE_URL}/orders/verify-pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hotelToken}`
      },
      body: JSON.stringify({
        orderIdOrPin: pickupPin
      })
    }).then(r => r.json());

    assert(verifyPickupRes.success === true && verifyPickupRes.data.orderStatus === 'Collected', `Order verified and marked as Collected using PIN ${pickupPin}`);

    // Duplicate verification test (should fail)
    const duplicateVerifyRes = await fetch(`${BASE_URL}/orders/verify-pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hotelToken}`
      },
      body: JSON.stringify({
        orderIdOrPin: pickupPin
      })
    }).then(r => r.json());

    assert(duplicateVerifyRes.success === false, 'Duplicate verification correctly rejected by backend');

    // 10. Admin Dashboard & Expired Listings
    console.log('\n--- 10. Testing Admin Endpoints ---');
    const adminStatsRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(adminStatsRes.success === true && adminStatsRes.data.impact.totalMealsRescued > 0, `Admin stats computed: ${adminStatsRes.data?.impact.totalMealsRescued} meals rescued, ${adminStatsRes.data?.impact.totalPeopleNourished} people nourished`);

    const expiredListingsRes = await fetch(`${BASE_URL}/admin/expired-listings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(expiredListingsRes.success === true, `Admin expired listings audit returned ${expiredListingsRes.count} expired items`);

    const adminReportRes = await fetch(`${BASE_URL}/admin/report`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(adminReportRes.success === true && adminReportRes.data.summaryStats.totalHotels > 0, 'Admin report generated real database dataset for print/PDF export');

    // 11. Impact Statistics Endpoint
    console.log('\n--- 11. Testing Impact Statistics ---');
    const impactRes = await fetch(`${BASE_URL}/impact`).then(r => r.json());
    assert(impactRes.success === true && impactRes.data.totalMealsRescued > 0 && Array.isArray(impactRes.data.monthlyStats), `Impact statistics API computed: ${impactRes.data?.totalMealsRescued} meals, ${impactRes.data?.totalKgRescued} kg, monthly trajectory calculated`);

    // 12. Mock Payment Simulation Workflow
    console.log('\n--- 12. Testing Mock Payment Simulation Workflow ---');
    const mockPaymentOrder = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trustToken}`
      },
      body: JSON.stringify({
        foodId: createdFoodId,
        quantity: 2,
        simulateOutcome: 'success'
      })
    }).then(r => r.json());

    assert(mockPaymentOrder.success === true && mockPaymentOrder.isMockSimulation === true, 'Mock payment simulation session created without deducting real money');

    // Test simulated bank decline outcome
    const declinedVerify = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trustToken}`
      },
      body: JSON.stringify({
        testOrderId: mockPaymentOrder.testOrderId,
        simulationToken: mockPaymentOrder.simulationToken,
        simulateOutcome: 'failed'
      })
    }).then(r => r.json());

    assert(declinedVerify.success === false && declinedVerify.error.includes('declined'), 'Payment simulation properly supports simulated failure status');

    // Clean up created test food listing
    await fetch(`${BASE_URL}/food/${createdFoodId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${hotelToken}` }
    });

    console.log('\n======================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
