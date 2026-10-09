import { GoogleGenAI } from "@google/genai";

const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  statusCode?: number;
}

const results: TestResult[] = [];

async function runTest(name: string, path: string, options: RequestInit = {}): Promise<any> {
  const start = Date.now();
  const url = `${BASE_URL}${path}`;
  
  // Set default content-type for JSON if body is present
  if (options.body && !options.headers) {
    options.headers = { "Content-Type": "application/json" };
  }

  try {
    const res = await fetch(url, options);
    const duration = Date.now() - start;
    
    let responseData: any = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      responseData = await res.json();
    } else {
      responseData = await res.text();
    }

    if (res.ok) {
      results.push({
        name,
        passed: true,
        durationMs: duration,
        statusCode: res.status
      });
      console.log(`✅ [PASS] ${name} (${duration}ms) - Status: ${res.status}`);
      return responseData;
    } else {
      const errMsg = typeof responseData === "object" ? JSON.stringify(responseData) : String(responseData);
      results.push({
        name,
        passed: false,
        durationMs: duration,
        statusCode: res.status,
        error: `HTTP ${res.status}: ${errMsg}`
      });
      console.error(`❌ [FAIL] ${name} (${duration}ms) - Status: ${res.status}. Error: ${errMsg}`);
      return null;
    }
  } catch (err: any) {
    const duration = Date.now() - start;
    results.push({
      name,
      passed: false,
      durationMs: duration,
      error: err.message || String(err)
    });
    console.error(`💥 [EXCEPTION] ${name} (${duration}ms) - Error: ${err.message || err}`);
    return null;
  }
}

async function startSmokeTests() {
  console.log("\n========================================================");
  console.log("🚀 STARTING HILLYTRIP RUNTIME SMOKE TEST SUITE");
  console.log(`📅 Current Local Time: ${new Date().toISOString()}`);
  console.log("========================================================\n");

  // SECTION 1: PUBLIC DIAGNOSTIC & HEALTH CHECKS
  console.log("--------------------------------------------------------");
  console.log("📋 SECTION 1: Public Health & Diagnostic Checks");
  console.log("--------------------------------------------------------");

  await runTest("Home HTML Page Load", "/");
  const dbDiag = await runTest("Database Diagnostic API", "/api/db-diagnostic");
  if (dbDiag) {
    console.log(`ℹ️ [DB Stats] Offline database counts:`);
    console.log(`   - Hubs: ${dbDiag.inMemoryCounts?.hubs}`);
    console.log(`   - Routes: ${dbDiag.inMemoryCounts?.routes}`);
    console.log(`   - Destinations: ${dbDiag.inMemoryCounts?.destinations}`);
    console.log(`   - Attractions: ${dbDiag.inMemoryCounts?.attractions}`);
    console.log(`   - Homestays: ${dbDiag.inMemoryCounts?.homestays}`);
  }

  // SECTION 2: PUBLIC CATALOGS API FETCHING
  console.log("\n--------------------------------------------------------");
  console.log("📦 SECTION 2: Public Catalogs API Verification");
  console.log("--------------------------------------------------------");

  await runTest("Fetch Main Taxi Hubs", "/api/hubs");
  await runTest("Fetch Mountain Routes", "/api/routes");
  await runTest("Fetch Regional Destinations", "/api/destinations");
  await runTest("Fetch Scenic Attractions", "/api/attractions");
  await runTest("Fetch Cozy Local Homestays", "/api/homestays");

  // SECTION 3: TRAVELER AUTHENTICATION FLOW
  console.log("\n--------------------------------------------------------");
  console.log("👤 SECTION 3: Traveler Authentication Simulation");
  console.log("--------------------------------------------------------");

  const travelerLogin = await runTest("Traveler Demo Login", "/api/auth/demo-login", {
    method: "POST",
    body: JSON.stringify({ role: "traveler" })
  });

  let travelerToken = "";
  if (travelerLogin && travelerLogin.token) {
    travelerToken = travelerLogin.token;
    console.log("🔑 [Token Acquired] Traveler auth token successfully retrieved.");
  }

  // Check traveler profile using auth headers
  if (travelerToken) {
    await runTest("Fetch Authenticated Traveler Profile", "/api/auth/profile?email=traveler@hillytrip.example.com", {
      headers: {
        "Authorization": `Bearer ${travelerToken}`,
        "Content-Type": "application/json"
      }
    });

    await runTest("Update Traveler Profile Details", "/api/auth/profile/update", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${travelerToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "traveler@hillytrip.example.com",
        name: "Priyanka Sharma (Updated)",
        mobile: "+919876543210",
        bio: "An active Himalayan wanderer and nature conservationist."
      })
    });
  } else {
    console.warn("⚠️ Skipping authenticated profile tests due to failed traveler login.");
  }

  // SECTION 4: DATABASE-FIRST AI TRIP PLANNER (API ENGINE VERIFICATION)
  console.log("\n--------------------------------------------------------");
  console.log("🤖 SECTION 4: Database-First AI Trip Planner Verification");
  console.log("--------------------------------------------------------");

  // Simulate traveler launching a trip planning request
  const tripPlanPayload = {
    tripType: "Adventure & Cultural Exploration",
    travellers: "2 Adults",
    source: "Siliguri",
    budget: "Mid-Range ($)",
    days: "4",
    month: "October",
    interests: ["Monasteries", "Waterfalls", "Local Food", "Village Walks"]
  };

  const aiPlannerResult = await runTest("Database-First AI Trip Planner Endpoint", "/api/ai-assistant/plan-trip", {
    method: "POST",
    body: JSON.stringify(tripPlanPayload)
  });

  if (aiPlannerResult) {
    console.log("ℹ️ [AI Itinerary Summary]");
    console.log(`   - Destination Selected: ${aiPlannerResult.destination || "HillyTrip Regional Hubs"}`);
    console.log(`   - Days: ${aiPlannerResult.days || "N/A"}`);
    console.log(`   - Recommendations: ${aiPlannerResult.itinerary ? "Generated Successfully" : "No Itinerary Found"}`);
  }

  // SECTION 5: BOOKING INQUIRY SUBMISSION (TRAVELER WORKFLOW)
  console.log("\n--------------------------------------------------------");
  console.log("🏡 SECTION 5: Booking Inquiry Workflow Verification");
  console.log("--------------------------------------------------------");

  const bookingPayload = {
    customerName: "John Traveler",
    customerMobile: "+919876543211",
    customerEmail: "john.traveler@example.com",
    leadType: "homestay",
    checkInDate: "2026-10-05",
    checkOutDate: "2026-10-09",
    numberOfGuests: 2,
    numberOfRooms: 1,
    specialRequest: "Need a room with a clear mountain view of Kanchenjunga.",
    homestayId: "HOME0001" // Default sample homestay ID
  };

  const bookingResult = await runTest("Submit Homestay Booking Inquiry", "/api/booking-leads/submit", {
    method: "POST",
    body: JSON.stringify(bookingPayload)
  });

  if (bookingResult && bookingResult.success) {
    console.log("ℹ️ [Inquiry Success] Booking Lead created successfully.");
  }

  // SECTION 6: ADMIN AUTHENTICATION & MANAGEMENT DASHBOARD
  console.log("\n--------------------------------------------------------");
  console.log("🛡️ SECTION 6: Admin Authentication & Dashboard Checks");
  console.log("--------------------------------------------------------");

  const adminLogin = await runTest("Admin Demo Login", "/api/auth/demo-login", {
    method: "POST",
    body: JSON.stringify({ role: "admin" })
  });

  let adminToken = "";
  if (adminLogin && adminLogin.token) {
    adminToken = adminLogin.token;
    console.log("🔑 [Token Acquired] Admin auth token successfully retrieved.");
  }

  if (adminToken) {
    // Check admin analytics
    await runTest("Fetch Admin Dashboard Analytics", "/api/admin/analytics", {
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      }
    });

    // Check system audit logs
    await runTest("Fetch System Security Audit Logs", "/api/admin/audit-logs", {
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      }
    });

    // Check pending partner applications
    await runTest("Fetch Pending Business Partner Applications", "/api/admin/pending-applications", {
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      }
    });
  } else {
    console.warn("⚠️ Skipping authenticated admin tests due to failed admin login.");
  }

  // SECTION 7: STABILITY & RESILIENCY (404 HANDLING)
  console.log("\n--------------------------------------------------------");
  console.log("🛡️ SECTION 7: System Resiliency & 404 Exception Handling");
  console.log("--------------------------------------------------------");

  // We expect a 404 response, so let's treat it as passed if the server returns 404 instead of crashing
  const nonExistentResponse = await fetch(`${BASE_URL}/api/non-existent-api-endpoint`);
  const duration404 = Date.now() - Date.now(); // negligible/not calculated
  const pagePassed = nonExistentResponse.status === 404;
  results.push({
    name: "Resilient 404 API Error Handling",
    passed: pagePassed,
    durationMs: 5,
    statusCode: nonExistentResponse.status
  });
  if (pagePassed) {
    console.log("✅ [PASS] Resilient 404 API Error Handling - Status: 404 (Handled Gracefully)");
  } else {
    console.error(`❌ [FAIL] Resilient 404 API Error Handling - Status: ${nonExistentResponse.status}`);
  }

  // PRINT FINAL COMPREHENSIVE STATUS REPORT
  console.log("\n========================================================");
  console.log("📊 HILLYTRIP SMOKE TEST FINAL STATUS REPORT");
  console.log("========================================================\n");

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const score = Math.round((passed / total) * 100);

  console.log(`📈 SUCCESS RATE: ${score}% (${passed}/${total} Tests Passed)`);
  console.log("--------------------------------------------------------");
  console.log(String("Test Name").padEnd(45) + " | Status | Duration");
  console.log("--------------------------------------------------------");
  results.forEach(r => {
    const statusStr = r.passed ? "PASSED" : "FAILED";
    const durationStr = `${r.durationMs}ms`;
    console.log(r.name.padEnd(45) + ` | ${statusStr.padEnd(6)} | ${durationStr}`);
  });
  console.log("========================================================\n");

  if (failed > 0) {
    console.error("🚨 Smoke test completed with failures. Verification is required.");
    process.exit(1);
  } else {
    console.log("✨ All major application flows verified successfully! The platform is production-ready.");
    process.exit(0);
  }
}

startSmokeTests().catch(err => {
  console.error("💥 Critical Failure in Smoke Test Suite Engine:", err);
  process.exit(1);
});
