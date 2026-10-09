import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'hillytrip-jwt-secret-key-2026-production-fallback-key';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

function makeToken(user) {
  const rolesArr = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'traveler'];
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role || 'traveler', 
      roles: rolesArr,
      iss: 'hillytrip-auth-service',
      aud: 'hillytrip-api'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

const superAdminToken = makeToken({ id: 'usr_super_admin', email: 'admin@hillytrip.com', role: 'super_admin', roles: ['super_admin'] });
const travellerToken = makeToken({ id: 'usr_traveller_1', email: 'traveler@example.com', role: 'traveler', roles: ['traveler'] });
const ownerAToken = makeToken({ id: 'partner_owner_a', email: 'owner_a@test.com', role: 'partner', roles: ['partner'] });
const ownerBToken = makeToken({ id: 'partner_owner_b', email: 'owner_b@test.com', role: 'partner', roles: ['partner'] });

const adminHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${superAdminToken}`
};

function signPayment(orderId, paymentId) {
  return crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
}

async function payForBooking(bookingId) {
  // 1. Create order
  const orderRes = await fetch(`${BASE_URL}/api/booking/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId })
  }).then(r => r.json());

  if (!orderRes.success || !orderRes.orderId) {
    throw new Error(`Failed to create order for ${bookingId}: ${JSON.stringify(orderRes)}`);
  }

  const orderId = orderRes.orderId;
  const paymentId = `pay_qa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const signature = signPayment(orderId, paymentId);

  // 2. Verify payment
  const verifyRes = await fetch(`${BASE_URL}/api/booking/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    })
  }).then(r => r.json());

  return { orderId, paymentId, signature, verifyRes };
}

async function run() {
  console.log('====================================================');
  console.log('HILLYTRIP PHASE 3B - COMPREHENSIVE FINANCIAL QA SUITE');
  console.log('====================================================\n');

  const report = {};
  const TEST_YEAR = 2035 + (Math.floor(Date.now() / 1000) % 500);

  // Setup Test Homestay with priceMin = 2500 for exact ₹5,000 calculation (2 nights * 2500)
  console.log('--- Setting up ₹5,000 test homestay ---');
  const createHsRes = await fetch(`${BASE_URL}/api/admin/homestays`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      id: 'HS-FINANCE-5000',
      name: 'Finance QA Eco Resort',
      destinationId: 'dest-sillery',
      priceMin: 2500,
      priceMax: 3500,
      contact: '+91 9800000000'
    })
  }).then(r => r.json());
  console.log('Created test homestay HS-FINANCE-5000:', createHsRes.success);

  // Ensure owner profile for HS-FINANCE-5000 (partner_hillytrip) is set up and verified
  const partnerHillytripToken = makeToken({ id: 'partner_hillytrip', email: 'partner@hillytrip.com', role: 'partner', roles: ['partner'] });
  const profSubmit = await fetch(`${BASE_URL}/api/partner/payout-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${partnerHillytripToken}` },
    body: JSON.stringify({
      accountHolderName: 'Finance Host Partner',
      bankName: 'HDFC Bank',
      accountNumber: '5010022334455',
      confirmAccountNumber: '5010022334455',
      ifsc: 'HDFC0001234',
      upiId: 'finance@okhdfc'
    })
  }).then(r => r.json());

  const profId = profSubmit.profile?.id;
  if (profId) {
    await fetch(`${BASE_URL}/api/admin/payout-profiles/${profId}/verify`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({})
    });
    console.log('Verified partner_hillytrip payout profile:', profId);
  }

  // ----------------------------------------------------
  // TEST 1: BASE FINANCIAL SCENARIO (₹5,000 calculation)
  // ----------------------------------------------------
  console.log('\n>>> TEST 1: Base Financial Scenario (₹5,000)');
  const res1 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-01-10`,
      checkOutDate: `${TEST_YEAR}-01-12`, // 2 nights
      adults: 2, // no extra guest fee
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Base Test Guest',
      guestEmail: 'baseguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());

  const lead1 = res1.booking;
  const lead1Id = lead1?.id;
  const gross1 = lead1?.bookingAmount;
  const rate1 = lead1?.commissionRate;
  const comm1 = lead1?.commissionAmount;
  const owner1 = lead1?.ownerAmount;
  const mathOk1 = (gross1 === 5000) && (rate1 === 10) && (comm1 === 500) && (owner1 === 4500);
  console.log(`Lead 1 created: ${lead1Id}, Gross=₹${gross1}, Rate=${rate1}%, Commission=₹${comm1}, Owner=₹${owner1}. Exact Match to ₹5000 Scenario: ${mathOk1}`);

  report.test1 = {
    bookingId: lead1Id,
    gross: gross1,
    rate: rate1,
    commission: comm1,
    owner: owner1,
    exactMatch: mathOk1
  };

  // ----------------------------------------------------
  // TEST 2: FULL SUCCESS -> SETTLEMENT
  // ----------------------------------------------------
  console.log('\n>>> TEST 2: Full Success -> Settlement');
  const pay1Result = await payForBooking(lead1Id);
  console.log('Payment 1 verified:', pay1Result.verifyRes.success, 'paymentStatus=', pay1Result.verifyRes.booking?.paymentStatus);

  // Check admin settlements list
  const settleList2 = await fetch(`${BASE_URL}/api/admin/settlements`, { headers: adminHeaders }).then(r => r.json());
  const lead1AdminItem = settleList2.settlements?.find(s => s.id === lead1Id);
  console.log(`Lead 1 Admin List: isSettlementEligible=${lead1AdminItem?.isSettlementEligible}, payoutStatus=${lead1AdminItem?.payoutStatus}`);

  // Check partner settlements list
  const partnerList2 = await fetch(`${BASE_URL}/api/partner/settlements/partner_hillytrip`, {
    headers: { 'Authorization': `Bearer ${partnerHillytripToken}` }
  }).then(r => r.json());
  const lead1PartnerItem = partnerList2.settlements?.find(s => s.id === lead1Id);
  console.log(`Lead 1 Partner List: Found=${Boolean(lead1PartnerItem)}, ownerAmount=₹${lead1PartnerItem?.ownerAmount}, settlementStatus=${lead1PartnerItem?.settlementStatus}`);

  // Execute Settlement
  const settle1Res = await fetch(`${BASE_URL}/api/admin/settlements/${lead1Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      payoutMethod: 'NEFT',
      utrNumber: 'UTR2026NEFT001',
      payoutAmount: 4500,
      payoutDate: '2026-09-22',
      settlementNotes: 'Settlement for QA test 2'
    })
  }).then(r => r.json());
  console.log('Settlement 1 executed:', settle1Res.success, 'Status=', settle1Res.booking?.settlementStatus, 'UTR=', settle1Res.booking?.utrNumber, 'settledBy=', settle1Res.booking?.settledBy);

  // Verify activity log
  const log2Res = await fetch(`${BASE_URL}/api/booking-leads/${lead1Id}/activity-log`).then(r => r.json());
  const hasSettleLog = log2Res.logs?.some(l => l.activityType === 'settlement_completed');
  console.log('Activity log has settlement_completed:', hasSettleLog);

  report.test2 = {
    settlementSuccess: settle1Res.success,
    recordedStatus: settle1Res.booking?.settlementStatus,
    recordedUtr: settle1Res.booking?.utrNumber,
    payoutAmount: settle1Res.booking?.payoutAmount,
    settledBy: settle1Res.booking?.settledBy,
    hasActivityLog: hasSettleLog,
    inPartnerList: Boolean(lead1PartnerItem)
  };

  // ----------------------------------------------------
  // TEST 3: FULL REFUND BEFORE SETTLEMENT
  // ----------------------------------------------------
  console.log('\n>>> TEST 3: Full Refund Before Settlement');
  const res3 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-02-10`,
      checkOutDate: `${TEST_YEAR}-02-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Refund Guest',
      guestEmail: 'refundguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead3Id = res3.booking?.id;

  // Pay
  await payForBooking(lead3Id);

  // Refund
  const refund3Res = await fetch(`${BASE_URL}/api/booking/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: lead3Id,
      reason: 'Traveler cancelled prior to settlement',
      actor: 'Admin'
    })
  }).then(r => r.json());
  console.log('Refund 3 result:', refund3Res.success, 'paymentStatus=', refund3Res.booking?.paymentStatus, 'settlementStatus=', refund3Res.booking?.settlementStatus, 'refundAmount=₹', refund3Res.refundAmount);

  // Attempt settlement
  const settle3Res = await fetch(`${BASE_URL}/api/admin/settlements/${lead3Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTRREFUND003' })
  });
  const settle3Json = await settle3Res.json();
  console.log(`Settlement on refunded booking: HTTP ${settle3Res.status}:`, settle3Json.error);

  report.test3 = {
    refundSuccess: refund3Res.success,
    paymentStatus: refund3Res.booking?.paymentStatus,
    settlementStatus: refund3Res.booking?.settlementStatus,
    settlementBlocked: settle3Res.status >= 400,
    blockReason: settle3Json.error
  };

  // ----------------------------------------------------
  // TEST 4: PAYMENT FAILURE
  // ----------------------------------------------------
  console.log('\n>>> TEST 4: Payment Failure');
  const res4 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-03-10`,
      checkOutDate: `${TEST_YEAR}-03-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Fail Guest',
      guestEmail: 'failguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead4Id = res4.booking?.id;

  // Create order
  const order4 = await fetch(`${BASE_URL}/api/booking/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId: lead4Id })
  }).then(r => r.json());

  // Attempt verification with invalid cryptographic signature
  const fakeSignRes = await fetch(`${BASE_URL}/api/booking/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: lead4Id,
      razorpay_order_id: order4.orderId,
      razorpay_payment_id: 'pay_tampered_12345',
      razorpay_signature: 'invalid_forged_hmac_signature_abc'
    })
  });
  const fakeSignJson = await fakeSignRes.json();
  console.log(`Forged signature verification: HTTP ${fakeSignRes.status}:`, fakeSignJson.error);

  // Attempt settlement on unverified / unpaid booking
  const settle4Res = await fetch(`${BASE_URL}/api/admin/settlements/${lead4Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTRFAIL004' })
  });
  const settle4Json = await settle4Res.json();
  console.log(`Settlement on failed payment: HTTP ${settle4Res.status}:`, settle4Json.error);

  report.test4 = {
    forgedSignatureRejected: fakeSignRes.status === 400,
    settlementBlocked: settle4Res.status >= 400,
    blockReason: settle4Json.error
  };

  // ----------------------------------------------------
  // TEST 5: UNVERIFIED OWNER (Lifecycle)
  // ----------------------------------------------------
  console.log('\n>>> TEST 5: Unverified Owner Profile States');
  // Create homestay for owner C (unverified)
  await fetch(`${BASE_URL}/api/admin/homestays`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      id: 'HS-OWNER-C-UNVERIFIED',
      name: 'Owner C Himalayan Retreat',
      destinationId: 'dest-sillery',
      priceMin: 2500,
      priceMax: 3500
    })
  });

  const res5 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-OWNER-C-UNVERIFIED',
      checkInDate: `${TEST_YEAR}-04-10`,
      checkOutDate: `${TEST_YEAR}-04-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Owner C Guest',
      guestEmail: 'ownercguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead5Id = res5.booking?.id;
  await payForBooking(lead5Id);

  // 5.1: Profile NOT_SUBMITTED -> Attempt settlement
  const settle5NotSubmitted = await fetch(`${BASE_URL}/api/admin/settlements/${lead5Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTR501' })
  });
  const s5NotSubJson = await settle5NotSubmitted.json();
  console.log(`5.1 NOT_SUBMITTED: HTTP ${settle5NotSubmitted.status}:`, s5NotSubJson.error);

  // 5.2: Submit profile -> status PENDING_VERIFICATION
  const ownerCToken = makeToken({ id: 'partner_owner_c', email: 'ownerc@test.com', role: 'partner', roles: ['partner'] });
  // Map homestay to owner C
  await fetch(`${BASE_URL}/api/partner/payout-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerCToken}` },
    body: JSON.stringify({
      accountHolderName: 'Owner C Host',
      bankName: 'Axis Bank',
      accountNumber: '91234567890123',
      confirmAccountNumber: '91234567890123',
      ifsc: 'UTIB0000123',
      homestayId: 'HS-OWNER-C-UNVERIFIED'
    })
  });

  // Assign homestay partnerId on lead5 so owner payout profile matches
  await fetch(`${BASE_URL}/api/admin/settlements/${lead5Id}/update`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ assignedPartnerId: 'partner_owner_c' })
  });

  // Check settlement list for lead5
  const settleList5 = await fetch(`${BASE_URL}/api/admin/settlements`, { headers: adminHeaders }).then(r => r.json());
  const lead5Admin = settleList5.settlements?.find(s => s.id === lead5Id);
  console.log(`5.2 PENDING_VERIFICATION: isSettlementEligible=${lead5Admin?.isSettlementEligible}, payoutStatus=${lead5Admin?.payoutStatus}`);

  const settle5Pending = await fetch(`${BASE_URL}/api/admin/settlements/${lead5Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTR502' })
  });
  const s5PendJson = await settle5Pending.json();
  console.log(`5.2 PENDING_VERIFICATION settle attempt: HTTP ${settle5Pending.status}:`, s5PendJson.error);

  // 5.3: Reject profile
  const profs5 = await fetch(`${BASE_URL}/api/admin/payout-profiles`, { headers: adminHeaders }).then(r => r.json());
  const profC = profs5.profiles?.find(p => p.ownerUserId === 'partner_owner_c');
  if (profC) {
    await fetch(`${BASE_URL}/api/admin/payout-profiles/${profC.id}/reject`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ reason: 'IFSC does not match bank branch' })
    });
    console.log('5.3 Profile rejected for owner C');

    const settle5Reject = await fetch(`${BASE_URL}/api/admin/settlements/${lead5Id}/settle`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ utrNumber: 'UTR503' })
    });
    const s5RejJson = await settle5Reject.json();
    console.log(`5.3 REJECTED settle attempt: HTTP ${settle5Reject.status}:`, s5RejJson.error);

    // 5.4: Verify profile
    await fetch(`${BASE_URL}/api/admin/payout-profiles/${profC.id}/verify`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({})
    });
    console.log('5.4 Profile verified for owner C');

    const settle5Verify = await fetch(`${BASE_URL}/api/admin/settlements/${lead5Id}/settle`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ utrNumber: 'UTR504VERIFIED', payoutAmount: 4500 })
    });
    const s5VerJson = await settle5Verify.json();
    console.log(`5.4 VERIFIED settle attempt: HTTP ${settle5Verify.status}:`, s5VerJson.success ? 'SUCCESS!' : s5VerJson.error);

    report.test5 = {
      notSubmittedBlocked: settle5NotSubmitted.status >= 400,
      pendingBlocked: settle5Pending.status >= 400,
      rejectedBlocked: settle5Reject.status >= 400,
      verifiedSettled: settle5Verify.status === 200
    };
  }

  // ----------------------------------------------------
  // TEST 6: DUPLICATE SETTLEMENT
  // ----------------------------------------------------
  console.log('\n>>> TEST 6: Duplicate Settlement Protection');
  // Attempt to settle lead1 again (already settled in Test 2)
  const dup1Res = await fetch(`${BASE_URL}/api/admin/settlements/${lead1Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTR2026NEFT001', payoutAmount: 4500 })
  });
  const dup1Json = await dup1Res.json();
  console.log(`Same UTR duplicate settlement: HTTP ${dup1Res.status}:`, dup1Json.error);

  const dup2Res = await fetch(`${BASE_URL}/api/admin/settlements/${lead1Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTR_NEW_DIFFERENT_888', payoutAmount: 4500 })
  });
  const dup2Json = await dup2Res.json();
  console.log(`Different UTR duplicate settlement: HTTP ${dup2Res.status}:`, dup2Json.error);

  report.test6 = {
    sameUtrRejected: dup1Res.status === 409,
    differentUtrRejected: dup2Res.status === 409
  };

  // ----------------------------------------------------
  // TEST 7: CONCURRENT SETTLEMENT
  // ----------------------------------------------------
  console.log('\n>>> TEST 7: Concurrent Settlement Race Condition');
  const res7 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-05-10`,
      checkOutDate: `${TEST_YEAR}-05-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Conc Guest',
      guestEmail: 'concguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead7Id = res7.booking?.id;
  await payForBooking(lead7Id);

  const [concA, concB] = await Promise.all([
    fetch(`${BASE_URL}/api/admin/settlements/${lead7Id}/settle`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ utrNumber: 'UTRCONC_A', payoutAmount: 4500 })
    }).then(async r => ({ status: r.status, data: await r.json() })),
    fetch(`${BASE_URL}/api/admin/settlements/${lead7Id}/settle`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ utrNumber: 'UTRCONC_B', payoutAmount: 4500 })
    }).then(async r => ({ status: r.status, data: await r.json() }))
  ]);

  console.log(`Concurrent results: Req A: HTTP ${concA.status}, Req B: HTTP ${concB.status}`);
  const mutexEnforced = (concA.status === 200 && concB.status === 409) || (concA.status === 409 && concB.status === 200);
  console.log('Mutex enforced (one 200, one 409):', mutexEnforced);

  report.test7 = {
    reqAStatus: concA.status,
    reqBStatus: concB.status,
    mutexEnforced
  };

  // ----------------------------------------------------
  // TEST 8: PAYOUT AMOUNT TAMPERING
  // ----------------------------------------------------
  console.log('\n>>> TEST 8: Payout Amount Tampering');
  const res8 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-06-10`,
      checkOutDate: `${TEST_YEAR}-06-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Tamper Guest',
      guestEmail: 'tamper@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead8Id = res8.booking?.id;
  await payForBooking(lead8Id);

  // 8.1 Overpayment: ₹5,000 > ₹4,500
  const overpay = await fetch(`${BASE_URL}/api/admin/settlements/${lead8Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTROVER', payoutAmount: 5000 })
  });
  const overpayJson = await overpay.json();
  console.log(`Overpayment attempt (₹5000 vs ₹4500): HTTP ${overpay.status}:`, overpayJson.error);

  // 8.2 Underpayment: ₹4,000 < ₹4,500
  const underpay = await fetch(`${BASE_URL}/api/admin/settlements/${lead8Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTRUNDER', payoutAmount: 4000 })
  });
  const underpayJson = await underpay.json();
  console.log(`Underpayment attempt (₹4000 vs ₹4500): HTTP ${underpay.status}:`, underpayJson.success ? `Accepted custom payout amount ₹${underpayJson.booking?.payoutAmount}` : underpayJson.error);

  report.test8 = {
    overpaymentRejected: overpay.status === 400,
    underpaymentBehavior: underpay.status === 200 ? 'ACCEPTED_CUSTOM_AMOUNT' : 'REJECTED',
    recordedPayoutAmount: underpayJson.booking?.payoutAmount
  };

  // ----------------------------------------------------
  // TEST 9: COMMISSION TAMPERING
  // ----------------------------------------------------
  console.log('\n>>> TEST 9: Commission Tampering from Frontend');
  const res9 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-07-10`,
      checkOutDate: `${TEST_YEAR}-07-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Tamper Comm',
      guestEmail: 'tampercomm@example.com',
      guestPhone: '+91 9876543210',
      commissionRate: 0,
      commissionAmount: 0,
      ownerAmount: 999999
    })
  }).then(r => r.json());

  console.log(`Injected 0% commission on reserve -> Server stored: Rate=${res9.booking?.commissionRate}%, Comm=₹${res9.booking?.commissionAmount}, Owner=₹${res9.booking?.ownerAmount}`);
  const tamperPrevented = res9.booking?.commissionRate === 10 && res9.booking?.commissionAmount === 500 && res9.booking?.ownerAmount === 4500;

  report.test9 = {
    tamperPrevented,
    storedRate: res9.booking?.commissionRate,
    storedCommission: res9.booking?.commissionAmount,
    storedOwner: res9.booking?.ownerAmount
  };

  // ----------------------------------------------------
  // TEST 10: OWNER ISOLATION
  // ----------------------------------------------------
  console.log('\n>>> TEST 10: Owner Isolation & Cross-Tenant Access');
  const cross1 = await fetch(`${BASE_URL}/api/partner/settlements/partner_hillytrip`, {
    headers: { 'Authorization': `Bearer ${ownerAToken}` }
  });
  const cross1Json = await cross1.json();
  console.log(`Owner A querying partner_hillytrip settlements: HTTP ${cross1.status}:`, cross1Json.error);

  const unauth1 = await fetch(`${BASE_URL}/api/partner/payout-profile`);
  console.log(`Unauthenticated GET /api/partner/payout-profile: HTTP ${unauth1.status}`);

  report.test10 = {
    crossPartnerForbidden: cross1.status === 403,
    unauthForbidden: unauth1.status === 401
  };

  // ----------------------------------------------------
  // TEST 11: ADMIN AUTHORIZATION
  // ----------------------------------------------------
  console.log('\n>>> TEST 11: Admin Authorization Enforcement');
  const unauthAdmin = await fetch(`${BASE_URL}/api/admin/settlements`);
  const travAdmin = await fetch(`${BASE_URL}/api/admin/settlements`, { headers: { 'Authorization': `Bearer ${travellerToken}` } });
  const partAdmin = await fetch(`${BASE_URL}/api/admin/settlements`, { headers: { 'Authorization': `Bearer ${ownerAToken}` } });
  const superAdmin = await fetch(`${BASE_URL}/api/admin/settlements`, { headers: adminHeaders });

  console.log(`Unauth: HTTP ${unauthAdmin.status}, Traveller: HTTP ${travAdmin.status}, Partner: HTTP ${partAdmin.status}, Super Admin: HTTP ${superAdmin.status}`);

  report.test11 = {
    unauthBlocked: unauthAdmin.status === 401,
    travellerBlocked: travAdmin.status === 403,
    partnerBlocked: partAdmin.status === 403,
    superAdminAllowed: superAdmin.status === 200
  };

  // ----------------------------------------------------
  // TEST 12: UTR VALIDATION
  // ----------------------------------------------------
  console.log('\n>>> TEST 12: UTR Validation');
  const res12 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-08-10`,
      checkOutDate: `${TEST_YEAR}-08-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'UTR Guest',
      guestEmail: 'utrguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead12Id = res12.booking?.id;
  await payForBooking(lead12Id);

  // Empty UTR
  const utrEmpty = await fetch(`${BASE_URL}/api/admin/settlements/${lead12Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: '' })
  });
  // Whitespace UTR
  const utrSpace = await fetch(`${BASE_URL}/api/admin/settlements/${lead12Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: '    ' })
  });
  // Short UTR
  const utrShort = await fetch(`${BASE_URL}/api/admin/settlements/${lead12Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'AB' })
  });
  // Reused UTR from Test 2 ('UTR2026NEFT001')
  const utrReused = await fetch(`${BASE_URL}/api/admin/settlements/${lead12Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTR2026NEFT001', payoutAmount: 4500 })
  });
  const utrReusedJson = await utrReused.json();
  console.log(`Empty UTR: HTTP ${utrEmpty.status}, Whitespace UTR: HTTP ${utrSpace.status}, Short UTR: HTTP ${utrShort.status}`);
  console.log(`Reused UTR from another booking: HTTP ${utrReused.status}:`, utrReusedJson.success ? 'ACCEPTED (Cross-booking uniqueness not currently enforced)' : utrReusedJson.error);

  report.test12 = {
    emptyUtrRejected: utrEmpty.status === 400,
    whitespaceUtrRejected: utrSpace.status === 400,
    shortUtrRejected: utrShort.status === 400,
    crossBookingUtrUniquenessEnforced: utrReused.status === 400 || utrReused.status === 409
  };

  // ----------------------------------------------------
  // TEST 13: PAYOUT METHOD VALIDATION
  // ----------------------------------------------------
  console.log('\n>>> TEST 13: Payout Method Validation');
  const res13 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-09-10`,
      checkOutDate: `${TEST_YEAR}-09-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Method Guest',
      guestEmail: 'methodguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead13Id = res13.booking?.id;
  await payForBooking(lead13Id);

  const arbMethod = await fetch(`${BASE_URL}/api/admin/settlements/${lead13Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      utrNumber: 'UTR_MTHD_13',
      payoutMethod: 'ABC_RANDOM_PAYMENT',
      payoutAmount: 4500
    })
  });
  const arbMethodJson = await arbMethod.json();
  console.log(`Arbitrary payoutMethod 'ABC_RANDOM_PAYMENT': HTTP ${arbMethod.status}:`, arbMethodJson.success ? `Accepted (payoutMethod not strictly validated on backend)` : arbMethodJson.error);

  report.test13 = {
    arbitraryMethodRejected: arbMethod.status >= 400,
    recordedSettlementMethod: arbMethodJson.booking?.settlementMethod
  };

  // ----------------------------------------------------
  // TEST 14: EXECUTION DATE VALIDATION
  // ----------------------------------------------------
  console.log('\n>>> TEST 14: Execution Date Validation');
  const res14 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-10-10`,
      checkOutDate: `${TEST_YEAR}-10-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Date Guest',
      guestEmail: 'dateguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead14Id = res14.booking?.id;
  await payForBooking(lead14Id);

  const futureDate = await fetch(`${BASE_URL}/api/admin/settlements/${lead14Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      utrNumber: 'UTRFUTURE14',
      payoutDate: '2099-12-31',
      payoutAmount: 4500
    })
  });
  const futureDateJson = await futureDate.json();
  console.log(`Future date 2099-12-31: HTTP ${futureDate.status}:`, futureDateJson.success ? `Accepted payoutDate=${futureDateJson.booking?.payoutDate}` : futureDateJson.error);

  report.test14 = {
    futureDateRejected: futureDate.status >= 400,
    acceptedDate: futureDateJson.booking?.payoutDate
  };

  // ----------------------------------------------------
  // TEST 15: CANCELLED BOOKING SETTLEMENT
  // ----------------------------------------------------
  console.log('\n>>> TEST 15: Cancelled Booking Settlement');
  const res15 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-11-10`,
      checkOutDate: `${TEST_YEAR}-11-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Cancel Settle Guest',
      guestEmail: 'cancelsguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead15Id = res15.booking?.id;
  await payForBooking(lead15Id);

  // Mark as cancelled
  await fetch(`${BASE_URL}/api/booking-leads/${lead15Id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled', notes: 'Testing cancellation settlement guard' })
  });

  const cancelSettle = await fetch(`${BASE_URL}/api/admin/settlements/${lead15Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTRCANCEL15' })
  });
  const cancelSettleJson = await cancelSettle.json();
  console.log(`Settlement on cancelled booking: HTTP ${cancelSettle.status}:`, cancelSettleJson.error);

  report.test15 = {
    cancelledBookingBlocked: cancelSettle.status >= 400,
    blockReason: cancelSettleJson.error
  };

  // ----------------------------------------------------
  // TEST 16: COMPLETED BOOKING SETTLEMENT
  // ----------------------------------------------------
  console.log('\n>>> TEST 16: Completed Booking Settlement');
  const res16 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR}-12-10`,
      checkOutDate: `${TEST_YEAR}-12-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Complete Settle Guest',
      guestEmail: 'completesguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead16Id = res16.booking?.id;
  await payForBooking(lead16Id);

  // Set status to completed
  await fetch(`${BASE_URL}/api/booking-leads/${lead16Id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed', notes: 'Checkout done successfully' })
  });

  // Verify eligibility
  const settleList16 = await fetch(`${BASE_URL}/api/admin/settlements`, { headers: adminHeaders }).then(r => r.json());
  const lead16Item = settleList16.settlements?.find(s => s.id === lead16Id);
  console.log(`Completed booking eligibility: isSettlementEligible=${lead16Item?.isSettlementEligible}`);

  const completeSettle = await fetch(`${BASE_URL}/api/admin/settlements/${lead16Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTRCOMP16', payoutAmount: 4500 })
  });
  const compJson = await completeSettle.json();
  console.log(`Settlement on completed booking: HTTP ${completeSettle.status}:`, compJson.success ? 'SUCCESS!' : compJson.error);

  report.test16 = {
    completedBookingEligible: lead16Item?.isSettlementEligible,
    settlementSuccess: completeSettle.status === 200
  };

  // ----------------------------------------------------
  // TEST 17: PARTIAL REFUND BEHAVIOR
  // ----------------------------------------------------
  console.log('\n>>> TEST 17: Partial Refund Behavior');
  const res17 = await fetch(`${BASE_URL}/api/booking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homestayId: 'HS-FINANCE-5000',
      checkInDate: `${TEST_YEAR + 1}-01-10`,
      checkOutDate: `${TEST_YEAR + 1}-01-12`,
      adults: 2,
      children: 0,
      roomType: 'Standard Room',
      guestName: 'Partial Refund Guest',
      guestEmail: 'partialguest@example.com',
      guestPhone: '+91 9876543210'
    })
  }).then(r => r.json());
  const lead17Id = res17.booking?.id;
  await payForBooking(lead17Id);

  // Refund ₹1,000 partially
  const partRefund = await fetch(`${BASE_URL}/api/booking/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: lead17Id,
      amount: 1000,
      reason: 'Partial cancellation fee',
      actor: 'Admin'
    })
  }).then(r => r.json());

  console.log(`Partial refund of ₹1000 executed: refundAmount=₹${partRefund.refundAmount}, paymentStatus=${partRefund.booking?.paymentStatus}, settlementStatus=${partRefund.booking?.settlementStatus}`);
  console.log(`Post-partial-refund ownerAmount: ₹${partRefund.booking?.ownerAmount}`);

  // Attempt settlement on partially refunded booking
  const settlePart = await fetch(`${BASE_URL}/api/admin/settlements/${lead17Id}/settle`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ utrNumber: 'UTRPARTIAL17' })
  });
  const settlePartJson = await settlePart.json();
  console.log(`Settlement attempt on partially refunded booking: HTTP ${settlePart.status}:`, settlePartJson.error);

  report.test17 = {
    partialRefundAmount: partRefund.refundAmount,
    resultingPaymentStatus: partRefund.booking?.paymentStatus,
    resultingSettlementStatus: partRefund.booking?.settlementStatus,
    ownerAmountRecalculated: partRefund.booking?.ownerAmount !== 4500,
    settlementBlocked: settlePart.status >= 400,
    blockReason: settlePartJson.error
  };

  // ----------------------------------------------------
  // TEST 18: REFUND AFTER SETTLEMENT
  // ----------------------------------------------------
  console.log('\n>>> TEST 18: Refund After Settlement (Critical Vulnerability Analysis)');
  // lead1 is currently in 'Settled' status (UTR2026NEFT001, ₹4,500 paid to host)
  const refundSettledResp = await fetch(`${BASE_URL}/api/booking/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: lead1Id,
      reason: 'Late dispute after owner payout completed',
      actor: 'Tester'
    })
  });
  const refundSettled = await refundSettledResp.json();

  console.log(`Post-settlement refund response: HTTP ${refundSettledResp.status}:`, refundSettled.success ? `REFUND PERMITTED! paymentStatus=${refundSettled.booking?.paymentStatus}, settlementStatus=${refundSettled.booking?.settlementStatus}` : (refundSettled.error || refundSettled.code));

  report.test18 = {
    refundBlocked: refundSettledResp.status === 409 && refundSettled.code === 'ALREADY_SETTLED',
    statusCode: refundSettledResp.status,
    errorCode: refundSettled.code,
    refundPermittedAfterSettlement: Boolean(refundSettled.success),
    newPaymentStatus: refundSettled.booking?.paymentStatus,
    newSettlementStatus: refundSettled.booking?.settlementStatus,
    ownerPayoutReversed: false,
    hillytripAbsorbsLoss: Boolean(refundSettled.success)
  };

  // ----------------------------------------------------
  // TEST 19: PAYMENT WEBHOOK / DUPLICATION
  // ----------------------------------------------------
  console.log('\n>>> TEST 19: Payment Webhook Replay / Duplication');
  const replay = await fetch(`${BASE_URL}/api/booking/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: lead16Id,
      razorpay_order_id: pay1Result.orderId,
      razorpay_payment_id: pay1Result.paymentId,
      razorpay_signature: pay1Result.signature
    })
  }).then(r => r.json());

  console.log('Payment replay check:', replay.alreadyVerified ? 'ALREADY_VERIFIED idempotent handled' : (replay.error || replay));

  report.test19 = {
    duplicateSafelyHandled: Boolean(replay.alreadyVerified || replay.error),
    replayResponse: replay.message || replay.error
  };

  // ----------------------------------------------------
  // TEST 20: ACCOUNTING CONSISTENCY
  // ----------------------------------------------------
  console.log('\n>>> TEST 20: Accounting Consistency Check Across All Records');
  const allSettlements = await fetch(`${BASE_URL}/api/admin/settlements`, { headers: adminHeaders }).then(r => r.json());
  let allMatch = true;
  let countChecked = 0;
  for (const s of allSettlements.settlements || []) {
    const gross = Number(s.bookingAmount || 0);
    const comm = Number(s.commissionAmount || 0);
    const owner = Number(s.ownerAmount || 0);
    if (gross > 0) {
      countChecked++;
      if (gross !== Math.round((comm + owner) * 100) / 100) {
        allMatch = false;
        console.log(`Mismatch on lead ${s.id}: gross ${gross} != comm ${comm} + owner ${owner}`);
      }
    }
  }
  console.log(`Audited ${countChecked} booking records: 100% Gross = Commission + Owner: ${allMatch}`);

  report.test20 = {
    recordsAudited: countChecked,
    mathematicalIdentityConsistent: allMatch
  };

  console.log('\n====================================================');
  console.log('FINAL RAW JSON REPORT DATA:');
  console.log(JSON.stringify(report, null, 2));
  console.log('====================================================');
}

run().catch(console.error);
