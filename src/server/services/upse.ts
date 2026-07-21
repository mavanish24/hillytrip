import { dbStore, writeToInteractions } from '../db';
import {
  UPSEPayment,
  UPSEPaymentFlow,
  UPSEPaymentProvider,
  UPSEPaymentStatus,
  UPSESettlementType,
  UPSECommissionType,
  UPSECancellationPolicyType,
  UPSESettlementRule,
  UPSECommissionRule,
  UPSERefund,
  UPSERefundPolicyRule,
  UPSEPayoutAccount,
  UPSELedgerEntry
} from '../../types/upse';

// Seed default rules and sample accounts/payments to make dashboards fully functional out-of-the-box
export function seedUPSE() {
  const data = (dbStore as any).data;

  // Initialize arrays in dbStore.data if not exists
  if (!data.upsePayments) data.upsePayments = [];
  if (!data.upseSettlementRules) data.upseSettlementRules = [];
  if (!data.upseCommissionRules) data.upseCommissionRules = [];
  if (!data.upseRefunds) data.upseRefunds = [];
  if (!data.upsePayoutAccounts) data.upsePayoutAccounts = [];
  if (!data.upseLedger) data.upseLedger = [];

  let modified = false;

  // 1. Seed Default Commission Rules
  if (data.upseCommissionRules.length === 0) {
    const rules: UPSECommissionRule[] = [
      { id: 'comm_default_homestay', entityType: 'homestay', commissionType: 'percentage', value: 10, isEnabled: true },
      { id: 'comm_default_taxi', entityType: 'taxi', commissionType: 'percentage', value: 5, isEnabled: true },
      { id: 'comm_special_hillytrip', entityType: 'homestay', commissionType: 'business_specific', value: 8, businessId: 'partner_hillytrip', isEnabled: true },
      { id: 'comm_flat_guide', entityType: 'guide', commissionType: 'fixed_fee', value: 500, isEnabled: true },
      { id: 'comm_campaign_promo', entityType: 'homestay', commissionType: 'campaign_based', value: 3, campaignCode: 'SUMMER26', isEnabled: true }
    ];
    data.upseCommissionRules = rules;
    modified = true;
  }

  // 2. Seed Default Bank / Payout Accounts for our three partners
  if (data.upsePayoutAccounts.length === 0) {
    const accounts: UPSEPayoutAccount[] = [
      {
        id: 'acc_hilly_primary',
        businessId: 'partner_hillytrip',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50200045612398',
        routingNumberOrIfsc: 'HDFC0000120',
        accountHolderName: 'HillyTrip Premium Stays LLC',
        isPrimary: true,
        payoutType: 'bank'
      },
      {
        id: 'acc_hilly_upi',
        businessId: 'partner_hillytrip',
        bankName: 'UPI Pocket',
        accountNumber: '',
        routingNumberOrIfsc: '',
        accountHolderName: 'HillyTrip Operations',
        isPrimary: false,
        payoutType: 'upi',
        upiId: 'hillytrip@hdfcbank'
      },
      {
        id: 'acc_amit_primary',
        businessId: 'partner_amit',
        bankName: 'State Bank of India',
        accountNumber: '30456120984',
        routingNumberOrIfsc: 'SBIN0002140',
        accountHolderName: 'Amit Himalayan Homestays',
        isPrimary: true,
        payoutType: 'bank'
      },
      {
        id: 'acc_anjali_primary',
        businessId: 'partner_anjali',
        bankName: 'ICICI Bank',
        accountNumber: '001205001245',
        routingNumberOrIfsc: 'ICIC0000011',
        accountHolderName: 'Anjali Mountain Treks & Cabs',
        isPrimary: true,
        payoutType: 'bank'
      }
    ];
    data.upsePayoutAccounts = accounts;
    modified = true;
  }

  // 3. Seed Settlement Rules for the partners
  if (data.upseSettlementRules.length === 0) {
    const rules: UPSESettlementRule[] = [
      {
        id: 'rule_hilly_settle',
        businessId: 'partner_hillytrip',
        settlementType: 'instant',
        payoutBankAccountId: 'acc_hilly_primary',
        isEnabled: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rule_amit_settle',
        businessId: 'partner_amit',
        settlementType: 'weekly',
        payoutBankAccountId: 'acc_amit_primary',
        isEnabled: true,
        frequencyDetail: 'friday',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rule_anjali_settle',
        businessId: 'partner_anjali',
        settlementType: 'monthly',
        payoutBankAccountId: 'acc_anjali_primary',
        isEnabled: true,
        frequencyDetail: '1st of month',
        updatedAt: new Date().toISOString()
      }
    ];
    data.upseSettlementRules = rules;
    modified = true;
  }

  // 4. Seed Transactional ledger & Payments to populate dashboards
  if (data.upsePayments.length === 0) {
    const samplePayments: UPSEPayment[] = [
      {
        id: 'pay_1001_hilly',
        bookingId: 'B-1002',
        businessId: 'partner_hillytrip',
        travelerId: 'traveller_amit@hillytrip.com',
        provider: 'stripe',
        providerTransactionId: 'ch_stripe_9a8b7c6d5e',
        amount: 8500,
        currency: 'INR',
        taxes: 1296, // 18% GST (on service/base) or flat simulated
        fees: 170,   // 2% gateway fee
        commission: 680, // 8% partner commission
        settlementAmount: 6354, // 8500 - 1296 - 170 - 680
        status: 'captured',
        paymentFlow: 'full',
        auditHistory: [
          { status: 'draft', updatedBy: 'system', timestamp: '2026-07-15T10:00:00Z', note: 'Draft payment created' },
          { status: 'payment_initiated', updatedBy: 'traveler', timestamp: '2026-07-15T10:02:00Z', note: 'Stripe Checkout opened' },
          { status: 'authorized', updatedBy: 'stripe_webhook', timestamp: '2026-07-15T10:03:15Z', note: 'Stripe intent authorized' },
          { status: 'captured', updatedBy: 'system_capture', timestamp: '2026-07-15T10:03:30Z', note: 'Payment captured successfully' }
        ],
        metadata: { reservation_name: 'Pinecone Suite Homestay', guests: 2 },
        createdAt: '2026-07-15T10:00:00Z',
        updatedAt: '2026-07-15T10:03:30Z'
      },
      {
        id: 'pay_1002_amit',
        bookingId: 'B-1008',
        businessId: 'partner_amit',
        travelerId: 'traveller_priya@hillytrip.com',
        provider: 'razorpay',
        providerTransactionId: 'pay_rzp_99014207125',
        amount: 4500,
        currency: 'INR',
        taxes: 686,
        fees: 90,
        commission: 225, // 5% default taxi / homestay percentage
        settlementAmount: 3499,
        status: 'captured',
        paymentFlow: 'advance',
        auditHistory: [
          { status: 'draft', updatedBy: 'system', timestamp: '2026-07-17T11:15:00Z' },
          { status: 'payment_initiated', updatedBy: 'traveler', timestamp: '2026-07-17T11:16:10Z' },
          { status: 'captured', updatedBy: 'razorpay_webhook', timestamp: '2026-07-17T11:17:05Z', note: 'Direct capture via Razorpay API' }
        ],
        metadata: { room_type: 'Mountain View Deluxe' },
        createdAt: '2026-07-17T11:15:00Z',
        updatedAt: '2026-07-17T11:17:05Z'
      },
      {
        id: 'pay_1003_hilly',
        bookingId: 'B-1010',
        businessId: 'partner_hillytrip',
        travelerId: 'traveller_rohan@hillytrip.com',
        provider: 'phonepe',
        providerTransactionId: 'tx_ppe_87210943',
        amount: 12000,
        currency: 'INR',
        taxes: 1830,
        fees: 240,
        commission: 960,
        settlementAmount: 8970,
        status: 'refunded',
        paymentFlow: 'full',
        auditHistory: [
          { status: 'draft', updatedBy: 'system', timestamp: '2026-07-18T09:00:00Z' },
          { status: 'captured', updatedBy: 'phonepe_webhook', timestamp: '2026-07-18T09:04:12Z' },
          { status: 'refund_pending', updatedBy: 'traveler_request', timestamp: '2026-07-19T14:30:00Z', note: 'Traveler requested cancellation (within 24h Flexible policy)' },
          { status: 'refunded', updatedBy: 'admin_approver', timestamp: '2026-07-19T16:00:00Z', note: 'Full Refund approved and processed via PhonePe adapter' }
        ],
        metadata: { reason: 'Severe rain advisory in area' },
        createdAt: '2026-07-18T09:00:00Z',
        updatedAt: '2026-07-19T16:00:00Z'
      },
      {
        id: 'pay_1004_anjali',
        bookingId: 'B-1012',
        businessId: 'partner_anjali',
        travelerId: 'spammer_dan@example.com',
        provider: 'cashfree',
        providerTransactionId: 'cf_tx_9012487',
        amount: 3200,
        currency: 'INR',
        taxes: 488,
        fees: 64,
        commission: 160,
        settlementAmount: 2488,
        status: 'failed',
        paymentFlow: 'pay_at_property',
        auditHistory: [
          { status: 'draft', updatedBy: 'system', timestamp: '2026-07-20T16:30:00Z' },
          { status: 'payment_initiated', updatedBy: 'traveler', timestamp: '2026-07-20T16:31:00Z' },
          { status: 'failed', updatedBy: 'cashfree_gateway', timestamp: '2026-07-20T16:31:45Z', note: 'Insufficient funds / Card declined' }
        ],
        metadata: { attempt: 1 },
        createdAt: '2026-07-20T16:30:00Z',
        updatedAt: '2026-07-20T16:31:45Z'
      },
      {
        id: 'pay_1005_hilly',
        bookingId: 'B-1015',
        businessId: 'partner_hillytrip',
        travelerId: 'guest_user_99@hillytrip.com',
        provider: 'paypal',
        providerTransactionId: 'pay_pal_77c66d21',
        amount: 15000,
        currency: 'INR',
        taxes: 2288,
        fees: 300,
        commission: 1200,
        settlementAmount: 11212,
        status: 'authorized',
        paymentFlow: 'split',
        auditHistory: [
          { status: 'draft', updatedBy: 'system', timestamp: '2026-07-20T18:00:00Z' },
          { status: 'authorization_pending', updatedBy: 'paypal_intent', timestamp: '2026-07-20T18:02:00Z' },
          { status: 'authorized', updatedBy: 'paypal_webhook', timestamp: '2026-07-20T18:03:00Z', note: 'Payment authorized, awaiting operational dispatch for capture' }
        ],
        metadata: { trip_duration: '3 days' },
        createdAt: '2026-07-20T18:00:00Z',
        updatedAt: '2026-07-20T18:03:00Z'
      }
    ];
    data.upsePayments = samplePayments;
    modified = true;
  }

  // 5. Seed Refunds
  if (data.upseRefunds.length === 0) {
    const sampleRefunds: UPSERefund[] = [
      {
        id: 'ref_2001',
        paymentId: 'pay_1003_hilly',
        bookingId: 'B-1010',
        amount: 12000,
        reason: 'Flexible cancellation policy full refund - severe rain warning',
        status: 'processed',
        approvedBy: 'admin_finance@hillytrip.com',
        notes: 'Verified traveler safety cancellation. 100% credit dispatched back to customer.',
        auditTrail: [
          { action: 'request', actor: 'traveler', timestamp: '2026-07-19T14:30:00Z', note: 'Cancellation request' },
          { action: 'approve', actor: 'admin_finance@hillytrip.com', timestamp: '2026-07-19T15:45:00Z', note: 'Policy validated. Full refund approved.' },
          { action: 'process_success', actor: 'phonepe_gateway_payout', timestamp: '2026-07-19T16:00:00Z', note: 'Provider successfully refunded transaction.' }
        ],
        createdAt: '2026-07-19T14:30:00Z',
        updatedAt: '2026-07-19T16:00:00Z'
      }
    ];
    data.upseRefunds = sampleRefunds;
    modified = true;
  }

  // 6. Seed Ledger (Double-Entry Bookkeeping Principles)
  if (data.upseLedger.length === 0) {
    const entries: UPSELedgerEntry[] = [
      // Booking B-1002 (Captured Payment)
      {
        id: 'led_1001',
        paymentId: 'pay_1001_hilly',
        businessId: 'partner_hillytrip',
        type: 'credit',
        category: 'payment',
        amount: 8500,
        currency: 'INR',
        description: 'Captured client payment for Booking B-1002 via Stripe',
        isImmutable: true,
        createdAt: '2026-07-15T10:03:30Z'
      },
      {
        id: 'led_1002',
        paymentId: 'pay_1001_hilly',
        businessId: 'partner_hillytrip',
        type: 'debit',
        category: 'commission',
        amount: 680,
        currency: 'INR',
        description: 'HillyTrip 8% marketplace platform commission deduction',
        isImmutable: true,
        createdAt: '2026-07-15T10:03:30Z'
      },
      {
        id: 'led_1003',
        paymentId: 'pay_1001_hilly',
        businessId: 'partner_hillytrip',
        type: 'debit',
        category: 'fee',
        amount: 170,
        currency: 'INR',
        description: 'Stripe PG processing gateway fee (2%)',
        isImmutable: true,
        createdAt: '2026-07-15T10:03:30Z'
      },
      {
        id: 'led_1004',
        paymentId: 'pay_1001_hilly',
        businessId: 'partner_hillytrip',
        type: 'debit',
        category: 'fee',
        amount: 1296,
        currency: 'INR',
        description: 'GST (18%) tax withholding entry',
        isImmutable: true,
        createdAt: '2026-07-15T10:03:30Z'
      },
      // Booking B-1008
      {
        id: 'led_1005',
        paymentId: 'pay_1002_amit',
        businessId: 'partner_amit',
        type: 'credit',
        category: 'payment',
        amount: 4500,
        currency: 'INR',
        description: 'Advance deposit client payment for Booking B-1008 via Razorpay',
        isImmutable: true,
        createdAt: '2026-07-17T11:17:05Z'
      },
      {
        id: 'led_1006',
        paymentId: 'pay_1002_amit',
        businessId: 'partner_amit',
        type: 'debit',
        category: 'commission',
        amount: 225,
        currency: 'INR',
        description: 'HillyTrip platform commission (5%)',
        isImmutable: true,
        createdAt: '2026-07-17T11:17:05Z'
      },
      // Refund ledger
      {
        id: 'led_1007',
        paymentId: 'pay_1003_hilly',
        refundId: 'ref_2001',
        businessId: 'partner_hillytrip',
        type: 'debit',
        category: 'refund',
        amount: 12000,
        currency: 'INR',
        description: 'Refund processed to client for Booking B-1010 due to cancellation',
        isImmutable: true,
        createdAt: '2026-07-19T16:00:00Z'
      }
    ];
    data.upseLedger = entries;
    modified = true;
  }

  if (modified) {
    dbStore.save();
    console.log('[UPSE Engine] Seeding of financial data complete.');
  }
}

// ----------------------------------------------------
// PROVIDER ADAPTERS ARCHITECTURE
// ----------------------------------------------------
export interface ProviderAdapter {
  createIntent(paymentId: string, amount: number, currency: string): Promise<{ providerTxId: string; status: UPSEPaymentStatus; instructions?: string }>;
  authorizeIntent(providerTxId: string): Promise<{ success: boolean; status: UPSEPaymentStatus }>;
  captureIntent(providerTxId: string, amountToCapture: number): Promise<{ success: boolean; capturedAmount: number; status: UPSEPaymentStatus }>;
  refundIntent(providerTxId: string, amountToRefund: number): Promise<{ success: boolean; refundedAmount: number; status: UPSEPaymentStatus }>;
}

export class MockGatewayAdapter implements ProviderAdapter {
  constructor(private provider: UPSEPaymentProvider) {}

  async createIntent(paymentId: string, amount: number, currency: string) {
    // Generate simulated remote gateway reference
    const randomHex = Math.random().toString(16).substring(2, 10);
    const providerTxId = `tx_${this.provider}_${randomHex}`;
    
    // Some flows are instant success, some require authorization pending
    const status: UPSEPaymentStatus = this.provider === 'paypal' ? 'authorization_pending' : 'payment_initiated';
    
    return {
      providerTxId,
      status,
      instructions: `To finalize this transaction, utilize the secure ${this.provider.toUpperCase()} portal.`
    };
  }

  async authorizeIntent(providerTxId: string) {
    // Simulate gateway success
    return {
      success: true,
      status: 'authorized' as const
    };
  }

  async captureIntent(providerTxId: string, amountToCapture: number) {
    return {
      success: true,
      capturedAmount: amountToCapture,
      status: 'captured' as const
    };
  }

  async refundIntent(providerTxId: string, amountToRefund: number) {
    return {
      success: true,
      refundedAmount: amountToRefund,
      status: 'refunded' as const
    };
  }
}

export const getAdapter = (provider: UPSEPaymentProvider): ProviderAdapter => {
  return new MockGatewayAdapter(provider);
};

// ----------------------------------------------------
// CORE ENGINE SERVICES
// ----------------------------------------------------

export class PaymentService {
  static createPayment(params: {
    bookingId: string;
    businessId: string;
    travelerId: string;
    amount: number;
    currency: string;
    provider: UPSEPaymentProvider;
    paymentFlow: UPSEPaymentFlow;
    metadata?: Record<string, any>;
  }): UPSEPayment {
    const data = (dbStore as any).data;
    const paymentId = 'pay_' + Math.random().toString(36).substring(2, 9);
    
    // Calculate Commission using CommissionService
    const commission = CommissionService.calculateCommission({
      businessId: params.businessId,
      amount: params.amount,
      entityType: params.metadata?.category || 'homestay',
      campaignCode: params.metadata?.campaignCode
    });

    // Calculate Taxes (Simulated 18% GST baseline on amount)
    const taxes = Math.round(params.amount * 0.18 * 100) / 100;
    
    // Gateway Fees (Simulated 2% fee baseline)
    const fees = Math.round(params.amount * 0.02 * 100) / 100;

    // Settlement Amount = total - commissions - taxes - fees
    // In Pay at Property, settlement is managed on-site, but we ledger it similarly or log it
    const settlementAmount = Math.max(0, Math.round((params.amount - commission - taxes - fees) * 100) / 100);

    const newPayment: UPSEPayment = {
      id: paymentId,
      bookingId: params.bookingId,
      businessId: params.businessId,
      travelerId: params.travelerId,
      provider: params.provider,
      amount: params.amount,
      currency: params.currency || 'INR',
      taxes,
      fees,
      commission,
      settlementAmount,
      status: 'draft',
      paymentFlow: params.paymentFlow,
      auditHistory: [
        { status: 'draft', updatedBy: 'system', timestamp: new Date().toISOString(), note: 'Financial payment record initialized' }
      ],
      metadata: params.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.upsePayments = data.upsePayments || [];
    data.upsePayments.push(newPayment);
    dbStore.save();

    // Publish creation events to active telemetry simulation
    writeToInteractions('upse_payment_created', paymentId, newPayment);
    writeToInteractions('upse_commission_calculated', paymentId, { commission, paymentId });

    return newPayment;
  }

  static async initiatePayment(paymentId: string): Promise<UPSEPayment> {
    const data = (dbStore as any).data;
    const payment = data.upsePayments?.find((p: any) => p.id === paymentId);
    if (!payment) throw new Error('Payment record not found');

    const adapter = getAdapter(payment.provider);
    const intentResult = await adapter.createIntent(payment.id, payment.amount, payment.currency);

    payment.providerTransactionId = intentResult.providerTxId;
    payment.status = intentResult.status;
    payment.auditHistory.push({
      status: intentResult.status,
      updatedBy: 'payment_service_initiate',
      timestamp: new Date().toISOString(),
      note: `Intent created with ID ${intentResult.providerTxId} via ${payment.provider} adapter.`
    });
    payment.updatedAt = new Date().toISOString();

    dbStore.save();
    writeToInteractions('upse_payment_initiated', paymentId, payment);
    return payment;
  }

  static async authorizePayment(paymentId: string): Promise<UPSEPayment> {
    const data = (dbStore as any).data;
    const payment = data.upsePayments?.find((p: any) => p.id === paymentId);
    if (!payment) throw new Error('Payment record not found');

    const adapter = getAdapter(payment.provider);
    const authResult = await adapter.authorizeIntent(payment.providerTransactionId || '');

    if (authResult.success) {
      payment.status = 'authorized';
      payment.auditHistory.push({
        status: 'authorized',
        updatedBy: 'payment_service_authorize',
        timestamp: new Date().toISOString(),
        note: `Authorized successfully via Gateway.`
      });
      payment.updatedAt = new Date().toISOString();
      dbStore.save();

      writeToInteractions('upse_payment_authorized', paymentId, payment);
    }
    return payment;
  }

  static async capturePayment(paymentId: string, manualAmount?: number): Promise<UPSEPayment> {
    const data = (dbStore as any).data;
    const payment = data.upsePayments?.find((p: any) => p.id === paymentId);
    if (!payment) throw new Error('Payment record not found');

    const adapter = getAdapter(payment.provider);
    const captureAmount = manualAmount || payment.amount;
    const captureResult = await adapter.captureIntent(payment.providerTransactionId || '', captureAmount);

    if (captureResult.success) {
      payment.status = manualAmount && manualAmount < payment.amount ? 'partially_captured' : 'captured';
      payment.auditHistory.push({
        status: payment.status,
        updatedBy: 'payment_service_capture',
        timestamp: new Date().toISOString(),
        note: `Captured amount INR ${captureAmount} successfully.`
      });
      payment.updatedAt = new Date().toISOString();

      // Create Immutable Ledger Entries
      LedgerService.addEntry({
        paymentId: payment.id,
        businessId: payment.businessId,
        type: 'credit',
        category: 'payment',
        amount: captureAmount,
        currency: payment.currency,
        description: `Captured client booking receipt via ${payment.provider}`
      });

      LedgerService.addEntry({
        paymentId: payment.id,
        businessId: payment.businessId,
        type: 'debit',
        category: 'commission',
        amount: payment.commission,
        currency: payment.currency,
        description: `Marketplace Platform commission charge`
      });

      LedgerService.addEntry({
        paymentId: payment.id,
        businessId: payment.businessId,
        type: 'debit',
        category: 'fee',
        amount: payment.fees,
        currency: payment.currency,
        description: `Gateway processing processing fee (2%)`
      });

      LedgerService.addEntry({
        paymentId: payment.id,
        businessId: payment.businessId,
        type: 'debit',
        category: 'fee',
        amount: payment.taxes,
        currency: payment.currency,
        description: `Withheld government compliance tax (18% GST)`
      });

      dbStore.save();
      writeToInteractions('upse_payment_captured', paymentId, payment);

      // Perform instant settlement immediately if settlement rule is set to 'instant'
      const rule = SettlementService.getRuleForBusiness(payment.businessId);
      if (rule && rule.isEnabled && rule.settlementType === 'instant') {
        await SettlementService.executeSettlementForPayment(payment);
      }
    }
    return payment;
  }

  static failPayment(paymentId: string, reason: string): UPSEPayment {
    const data = (dbStore as any).data;
    const payment = data.upsePayments?.find((p: any) => p.id === paymentId);
    if (!payment) throw new Error('Payment record not found');

    payment.status = 'failed';
    payment.auditHistory.push({
      status: 'failed',
      updatedBy: 'gateway_failure',
      timestamp: new Date().toISOString(),
      note: `Payment attempt failed. Reason: ${reason}`
    });
    payment.updatedAt = new Date().toISOString();

    dbStore.save();
    writeToInteractions('upse_payment_failed', paymentId, { payment, reason });
    return payment;
  }
}

export class CommissionService {
  static getCommissionRules(): UPSECommissionRule[] {
    const data = (dbStore as any).data;
    return data.upseCommissionRules || [];
  }

  static updateCommissionRule(rule: UPSECommissionRule) {
    const data = (dbStore as any).data;
    data.upseCommissionRules = data.upseCommissionRules || [];
    const idx = data.upseCommissionRules.findIndex((r: any) => r.id === rule.id);
    if (idx !== -1) {
      data.upseCommissionRules[idx] = rule;
    } else {
      data.upseCommissionRules.push(rule);
    }
    dbStore.save();
  }

  static calculateCommission(params: {
    businessId: string;
    amount: number;
    entityType: string;
    campaignCode?: string;
  }): number {
    const rules = this.getCommissionRules();
    
    // 1. Business specific commission override takes first priority
    const bizRule = rules.find(r => r.isEnabled && r.businessId === params.businessId && r.commissionType === 'business_specific');
    if (bizRule) {
      return Math.round(params.amount * (bizRule.value / 100) * 100) / 100;
    }

    // 2. Campaign based overrides take second priority
    if (params.campaignCode) {
      const campRule = rules.find(r => r.isEnabled && r.campaignCode === params.campaignCode && r.commissionType === 'campaign_based');
      if (campRule) {
        return Math.round(params.amount * (campRule.value / 100) * 100) / 100;
      }
    }

    // 3. Category/EntityType rules
    const catRule = rules.find(r => r.isEnabled && r.entityType === params.entityType);
    if (catRule) {
      if (catRule.commissionType === 'percentage') {
        return Math.round(params.amount * (catRule.value / 100) * 100) / 100;
      } else if (catRule.commissionType === 'fixed_fee') {
        return catRule.value;
      }
    }

    // Default fallbacks to zero
    return 0;
  }
}

export class RefundService {
  // Cancellation policy rules helper
  static getCancellationPolicyRule(policyType: UPSECancellationPolicyType): UPSERefundPolicyRule {
    switch (policyType) {
      case 'flexible':
        return {
          policyType,
          refundablePercentageBeforeDays: [
            { daysBefore: 1, refundPercentage: 100 },
            { daysBefore: 0, refundPercentage: 50 }
          ],
          description: 'Full refund up to 24 hours prior to travel, 50% afterward.'
        };
      case 'moderate':
        return {
          policyType,
          refundablePercentageBeforeDays: [
            { daysBefore: 3, refundPercentage: 100 },
            { daysBefore: 1, refundPercentage: 50 },
            { daysBefore: 0, refundPercentage: 0 }
          ],
          description: 'Full refund up to 72 hours before check-in, 50% up to 24 hours prior.'
        };
      case 'strict':
        return {
          policyType,
          refundablePercentageBeforeDays: [
            { daysBefore: 7, refundPercentage: 100 },
            { daysBefore: 3, refundPercentage: 25 },
            { daysBefore: 0, refundPercentage: 0 }
          ],
          description: 'Strict policy. No refunds issued within 72 hours of trip schedule.'
        };
      case 'custom':
      default:
        return {
          policyType: 'custom',
          refundablePercentageBeforeDays: [
            { daysBefore: 0, refundPercentage: 0 }
          ],
          description: 'Custom cancellation rules governed by business-specific criteria.'
        };
    }
  }

  static requestRefund(params: {
    paymentId: string;
    bookingId: string;
    reason: string;
    daysBeforeTrip: number;
    policyType: UPSECancellationPolicyType;
  }): UPSERefund {
    const data = (dbStore as any).data;
    const payment = data.upsePayments?.find((p: any) => p.id === params.paymentId);
    if (!payment) throw new Error('Associated payment record not found');

    // Calculate maximum refundable amount using configuration policy rules
    const policy = this.getCancellationPolicyRule(params.policyType);
    let refundPercentage = 0;
    
    // Iterate from highest days to locate matching bracket
    const sortedBrackets = [...policy.refundablePercentageBeforeDays].sort((a, b) => b.daysBefore - a.daysBefore);
    for (const bracket of sortedBrackets) {
      if (params.daysBeforeTrip >= bracket.daysBefore) {
        refundPercentage = bracket.refundPercentage;
        break;
      }
    }

    const maxRefundable = Math.round(payment.amount * (refundPercentage / 100) * 100) / 100;
    const refundId = 'ref_' + Math.random().toString(36).substring(2, 9);

    const newRefund: UPSERefund = {
      id: refundId,
      paymentId: params.paymentId,
      bookingId: params.bookingId,
      amount: maxRefundable,
      reason: `${params.reason} (Cancellation Policy applied: ${policy.description})`,
      status: 'pending_approval',
      auditTrail: [
        { action: 'request', actor: 'traveler', timestamp: new Date().toISOString(), note: `Refund of INR ${maxRefundable} requested (${refundPercentage}% of total booking amount)` }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.upseRefunds = data.upseRefunds || [];
    data.upseRefunds.push(newRefund);

    payment.status = 'refund_pending';
    payment.auditHistory.push({
      status: 'refund_pending',
      updatedBy: 'traveler_request',
      timestamp: new Date().toISOString(),
      note: `Refund requested for transaction. RefundID: ${refundId}`
    });

    dbStore.save();
    writeToInteractions('upse_refund_requested', refundId, newRefund);
    return newRefund;
  }

  static async approveRefund(refundId: string, approverEmail: string): Promise<UPSERefund> {
    const data = (dbStore as any).data;
    const refund = data.upseRefunds?.find((r: any) => r.id === refundId);
    if (!refund) throw new Error('Refund record not found');
    if (refund.status !== 'pending_approval') throw new Error('Refund is not in pending approval state');

    const payment = data.upsePayments?.find((p: any) => p.id === refund.paymentId);
    if (!payment) throw new Error('Associated payment record not found');

    // Call Provider Gateway
    const adapter = getAdapter(payment.provider);
    const gatewayRefund = await adapter.refundIntent(payment.providerTransactionId || '', refund.amount);

    if (gatewayRefund.success) {
      refund.status = 'processed';
      refund.approvedBy = approverEmail;
      refund.auditTrail.push({
        action: 'approve_and_process',
        actor: approverEmail,
        timestamp: new Date().toISOString(),
        note: `Approved and successfully settled via ${payment.provider} portal.`
      });
      refund.updatedAt = new Date().toISOString();

      payment.status = refund.amount < payment.amount ? 'partially_refunded' : 'refunded';
      payment.auditHistory.push({
        status: payment.status,
        updatedBy: approverEmail,
        timestamp: new Date().toISOString(),
        note: `Refund completed for amount INR ${refund.amount}. RefundID: ${refundId}`
      });

      // Write debit entry on ledger
      LedgerService.addEntry({
        paymentId: payment.id,
        refundId: refund.id,
        businessId: payment.businessId,
        type: 'debit',
        category: 'refund',
        amount: refund.amount,
        currency: payment.currency,
        description: `Processed refund to client on Booking ${refund.bookingId}`
      });

      dbStore.save();
      writeToInteractions('upse_payment_refunded', payment.id, { payment, refund });
    } else {
      refund.status = 'failed';
      refund.auditTrail.push({
        action: 'process_failure',
        actor: 'payment_gateway',
        timestamp: new Date().toISOString(),
        note: `Failed to execute transfer via provider.`
      });
      dbStore.save();
    }

    return refund;
  }
}

export class SettlementService {
  static getRuleForBusiness(businessId: string): UPSESettlementRule | undefined {
    const data = (dbStore as any).data;
    const rules = data.upseSettlementRules || [];
    return rules.find((r: any) => r.businessId === businessId && r.isEnabled);
  }

  static updateSettlementRule(rule: UPSESettlementRule) {
    const data = (dbStore as any).data;
    data.upseSettlementRules = data.upseSettlementRules || [];
    const idx = data.upseSettlementRules.findIndex((r: any) => r.businessId === rule.businessId);
    if (idx !== -1) {
      data.upseSettlementRules[idx] = rule;
    } else {
      data.upseSettlementRules.push(rule);
    }
    dbStore.save();
  }

  static getPayoutAccountsForBusiness(businessId: string): UPSEPayoutAccount[] {
    const data = (dbStore as any).data;
    return (data.upsePayoutAccounts || []).filter((a: any) => a.businessId === businessId);
  }

  static addPayoutAccount(account: UPSEPayoutAccount) {
    const data = (dbStore as any).data;
    data.upsePayoutAccounts = data.upsePayoutAccounts || [];
    
    // If setting to primary, unset all other accounts for this business
    if (account.isPrimary) {
      data.upsePayoutAccounts.forEach((a: any) => {
        if (a.businessId === account.businessId) {
          a.isPrimary = false;
        }
      });
    }

    data.upsePayoutAccounts.push(account);
    dbStore.save();
  }

  static async executeSettlementForPayment(payment: UPSEPayment): Promise<boolean> {
    const rule = this.getRuleForBusiness(payment.businessId);
    if (!rule || !rule.isEnabled) {
      console.log(`[Settlement Service] No active settlement rule found for business: ${payment.businessId}`);
      return false;
    }

    const accounts = this.getPayoutAccountsForBusiness(payment.businessId);
    const targetAccount = accounts.find(a => a.id === rule.payoutBankAccountId) || accounts.find(a => a.isPrimary);

    if (!targetAccount) {
      console.warn(`[Settlement Service] No active bank/UPI payout account linked for business: ${payment.businessId}`);
      return false;
    }

    // Write Settlement Entry to Financial Ledger
    LedgerService.addEntry({
      paymentId: payment.id,
      businessId: payment.businessId,
      type: 'debit',
      category: 'settlement',
      amount: payment.settlementAmount,
      currency: payment.currency,
      description: `Dispatched payout to account ${targetAccount.bankName || 'UPI'} (${targetAccount.accountNumber || targetAccount.upiId})`
    });

    writeToInteractions('upse_settlement_completed', payment.id, {
      paymentId: payment.id,
      businessId: payment.businessId,
      amount: payment.settlementAmount,
      targetAccount: targetAccount.accountHolderName,
      type: rule.settlementType
    });

    return true;
  }

  static async processScheduledSettlements(businessId: string): Promise<{ success: boolean; count: number; totalAmount: number }> {
    const data = (dbStore as any).data;
    const rule = this.getRuleForBusiness(businessId);
    if (!rule) return { success: false, count: 0, totalAmount: 0 };

    const paymentsToSettle = (data.upsePayments || []).filter(
      (p: any) => p.businessId === businessId && p.status === 'captured'
    );

    let count = 0;
    let totalAmount = 0;

    for (const payment of paymentsToSettle) {
      // Check if already settled in Ledger
      const isSettled = (data.upseLedger || []).some(
        (l: any) => l.paymentId === payment.id && l.category === 'settlement'
      );

      if (!isSettled) {
        const success = await this.executeSettlementForPayment(payment);
        if (success) {
          count++;
          totalAmount += payment.settlementAmount;
        }
      }
    }

    return { success: true, count, totalAmount };
  }
}

export class LedgerService {
  static addEntry(entry: Omit<UPSELedgerEntry, 'id' | 'isImmutable' | 'createdAt'>): UPSELedgerEntry {
    const data = (dbStore as any).data;
    const newEntry: UPSELedgerEntry = {
      ...entry,
      id: 'led_' + Math.random().toString(36).substring(2, 9),
      isImmutable: true,
      createdAt: new Date().toISOString()
    };

    data.upseLedger = data.upseLedger || [];
    data.upseLedger.push(newEntry);
    dbStore.save();

    return newEntry;
  }

  static getLedgerEntries(): UPSELedgerEntry[] {
    const data = (dbStore as any).data;
    return data.upseLedger || [];
  }
}
