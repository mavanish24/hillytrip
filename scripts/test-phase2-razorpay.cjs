const crypto = require('crypto');
try {
  require('dotenv').config();
} catch (e) {}

const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    ...options,
    headers
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, data: json };
}

function getFutureDateRange(daysAhead, durationNights) {
  const start = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + durationNights * 24 * 60 * 60 * 1000);
  return {
    checkIn: start.toISOString().split('T')[0],
    checkOut: end.toISOString().split('T')[0]
  };
}

async function runTests() {
  console.log('=== RUNNING PHASE 2 RAZORPAY INTEGRATION SUITE (TESTS 1-12) ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  // Pick an active homestay
  const homestaysRes = await request('/api/homestays');
  const sampleHomestay = homestaysRes.data[0];
  console.log(`Testing with Homestay: "${sampleHomestay.name}" (ID: ${sampleHomestay.id})\n`);

  // Use dynamically offset future dates (unique seed based on time to avoid overlaps)
  const baseOffset = 800 + Math.floor((Date.now() % 100000) / 100);
  const dates1 = getFutureDateRange(baseOffset, 3);

  // 1. Create a valid reservation
  const reserveRes = await request('/api/booking/reserve', {
    method: 'POST',
    body: JSON.stringify({
      homestayId: sampleHomestay.id,
      checkInDate: dates1.checkIn,
      checkOutDate: dates1.checkOut,
      adults: 2,
      children: 1,
      roomType: 'Deluxe Pine View Room',
      guestName: 'Arjun Verma',
      guestEmail: 'arjun.verma@example.com',
      guestPhone: '+91 9876543210',
      specialRequest: 'Late check-in at 6 PM'
    })
  });

  assert(reserveRes.status === 201 && reserveRes.data.success, 'Test 1: Valid reservation creation', `status=${reserveRes.status}`);
  const bookingId = reserveRes.data.bookingId;
  const originalBookingAmount = reserveRes.data.booking.bookingAmount;
  console.log(`  Created Booking ID: ${bookingId}, Authoritative Total: ₹${originalBookingAmount}`);

  // Test 1 (Cont): Create Razorpay Order
  const orderRes = await request('/api/booking/create-order', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: bookingId,
      customerName: 'Arjun Verma',
      customerEmail: 'arjun.verma@example.com',
      customerMobile: '+91 9876543210'
    })
  });

  assert(orderRes.status === 200 && orderRes.data.success && orderRes.data.orderId, 'Test 1: Create Razorpay Order from valid reservation', `orderId=${orderRes.data.orderId}`);
  const orderId = orderRes.data.orderId;
  const orderAmountPaise = orderRes.data.amount;
  assert(orderAmountPaise === originalBookingAmount * 100, 'Test 1b: Authoritative amount passed to Razorpay in paise', `expected=${originalBookingAmount * 100}, got=${orderAmountPaise}`);

  // Test 2: Order is bound to reservation
  const checkBookingRes = await request(`/api/booking-leads/${bookingId}`);
  const currentLead = checkBookingRes.data.lead;
  assert(currentLead && currentLead.orderId === orderId && currentLead.status === 'awaiting_payment', 'Test 2: Order ID bound to reservation with awaiting_payment status');

  // Test 3: Amount tamper attempt: client attempts lower/different amount than server calculated
  const tamperedOrderRes = await request('/api/booking/create-order', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: bookingId,
      amount: 100 // Client attempts to pass 1 INR instead of original total
    })
  });
  // Server must IGNORE client amount and always return authoritative order amount
  assert(tamperedOrderRes.data.amount === originalBookingAmount * 100, 'Test 3: Server ignores frontend tampered amount and uses authoritative price');

  // Test 4: Fake signature verification attempt
  const fakeVerifyRes = await request('/api/booking/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: bookingId,
      razorpay_order_id: orderId,
      razorpay_payment_id: 'pay_sim_fake123456789',
      razorpay_signature: '0000000000000000000000000000000000000000000000000000000000000000'
    })
  });
  assert(fakeVerifyRes.status === 400 && !fakeVerifyRes.data.success, 'Test 4: Fake signature verification is rejected', `msg=${fakeVerifyRes.data.error}`);

  // Test 5: Valid signature verification (crypto HMAC SHA256)
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder_mock_env';
  const testPaymentId = 'pay_sim_' + Date.now().toString(36);
  const expectedSign = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(orderId + '|' + testPaymentId)
    .digest('hex');

  const validVerifyRes = await request('/api/booking/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: bookingId,
      razorpay_order_id: orderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: expectedSign
    })
  });
  assert(validVerifyRes.status === 200 && validVerifyRes.data.success, 'Test 5: Cryptographically valid signature is verified successfully');

  // Test 6: Duplicate order creation on same reservation after payment or during
  const duplicateOrderRes = await request('/api/booking/create-order', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: bookingId
    })
  });
  // Once confirmed/paid, order creation must be rejected with already paid indicator
  assert(
    (duplicateOrderRes.status === 400 && duplicateOrderRes.data.alreadyPaid) ||
    duplicateOrderRes.data.orderId === orderId,
    'Test 6: Duplicate order creation handles confirmed/existing state safely',
    `status=${duplicateOrderRes.status}`
  );

  // Test 7: Payment verification updates reservation status to confirmed, paymentStatus = PAID, paidAt, paymentId, orderId
  const verifiedLead = validVerifyRes.data.booking;
  assert(
    verifiedLead &&
    verifiedLead.status === 'confirmed' &&
    verifiedLead.paymentStatus === 'PAID' &&
    verifiedLead.paymentId === testPaymentId &&
    verifiedLead.orderId === orderId &&
    Boolean(verifiedLead.paidAt),
    'Test 7: Verification updates reservation to status=confirmed, paymentStatus=PAID, paidAt timestamp, paymentId, orderId'
  );

  // Test 8: Failed payment does not confirm reservation
  const dates8 = getFutureDateRange(baseOffset + 15, 2);
  const failReserveRes = await request('/api/booking/reserve', {
    method: 'POST',
    body: JSON.stringify({
      homestayId: sampleHomestay.id,
      checkInDate: dates8.checkIn,
      checkOutDate: dates8.checkOut,
      adults: 2,
      children: 0,
      roomType: 'Deluxe Pine View Room',
      guestName: 'Rohit Sharma',
      guestEmail: 'rohit@example.com',
      guestPhone: '+91 9999988888'
    })
  });
  assert(failReserveRes.status === 201, 'Test 8a: Reserve stay for failed payment test');
  const failBookingId = failReserveRes.data.bookingId;

  await request('/api/booking/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: failBookingId,
      razorpay_order_id: 'order_nonexistent',
      razorpay_payment_id: 'pay_failed123',
      razorpay_signature: 'invalidsig'
    })
  });
  const failLeadRes = await request(`/api/booking-leads/${failBookingId}`);
  const failLead = failLeadRes.data.lead;
  assert(failLead.status !== 'confirmed' && failLead.paymentStatus !== 'PAID', 'Test 8: Failed payment leaves reservation unconfirmed (status!=confirmed, paymentStatus!=PAID)');

  // Test 9: Abandoned checkout does not confirm reservation
  const dates9 = getFutureDateRange(baseOffset + 30, 2);
  const abandonReserveRes = await request('/api/booking/reserve', {
    method: 'POST',
    body: JSON.stringify({
      homestayId: sampleHomestay.id,
      checkInDate: dates9.checkIn,
      checkOutDate: dates9.checkOut,
      adults: 2,
      children: 0,
      roomType: 'Deluxe Pine View Room',
      guestName: 'Pooja Bhatia',
      guestEmail: 'pooja@example.com',
      guestPhone: '+91 9111122222'
    })
  });
  assert(abandonReserveRes.status === 201, 'Test 9a: Reserve stay for abandoned checkout test');
  const abandonBookingId = abandonReserveRes.data.bookingId;

  await request('/api/booking/create-order', {
    method: 'POST',
    body: JSON.stringify({ bookingId: abandonBookingId })
  });
  const abandonLeadRes = await request(`/api/booking-leads/${abandonBookingId}`);
  const abandonLead = abandonLeadRes.data.lead;
  assert(abandonLead.status === 'awaiting_payment' && abandonLead.paymentStatus === 'PENDING', 'Test 9: Abandoned checkout preserves pending reservation without confirming');

  // Test 10: Owner amount + commission calculation correctness
  const total = verifiedLead.bookingAmount;
  const commission = verifiedLead.commissionAmount;
  const ownerAmt = verifiedLead.ownerAmount;
  assert(
    Math.round(total * 0.10) === Math.round(commission) &&
    Math.round(total - commission) === Math.round(ownerAmt),
    'Test 10: Owner amount (90%) and Platform Commission (10%) calculated accurately',
    `total=${total}, commission=${commission}, ownerAmt=${ownerAmt}`
  );

  // Test 11: Refund compatibility check
  const refundRes = await request('/api/booking/refund', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: bookingId,
      reason: 'Traveler test cancellation request'
    })
  });
  assert(refundRes.status === 200 && refundRes.data.success, 'Test 11: Refund compatibility check passes on confirmed and paid reservation', `status=${refundRes.status}`);

  // Test 12: Existing Razorpay webhook compatibility check
  const webhookEvent = {
    event: 'refund.processed',
    payload: {
      refund: {
        entity: {
          id: 'rfnd_sim_wh_' + Date.now().toString(36),
          payment_id: testPaymentId,
          amount: originalBookingAmount * 100,
          status: 'processed',
          notes: {
            bookingId: bookingId
          }
        }
      }
    }
  };
  const webhookPayloadStr = JSON.stringify(webhookEvent);
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_placeholder';
  const webhookSignature = crypto.createHmac('sha256', webhookSecret).update(webhookPayloadStr).digest('hex');

  const webhookRes = await request('/api/booking/webhook', {
    method: 'POST',
    headers: {
      'x-razorpay-signature': webhookSignature
    },
    body: webhookPayloadStr
  });
  assert(webhookRes.status === 200 && webhookRes.data.status === 'ok', 'Test 12: Razorpay webhook handles refund/payment event and is 100% compatible', `status=${webhookRes.status}, data=${JSON.stringify(webhookRes.data)}`);

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL 12 TESTS)`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
