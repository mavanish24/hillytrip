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
  UPSELedgerEntry,
  UPSECoupon,
  UPSEInvoice,
  UPSEWallet,
  UPSEWalletTransaction
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
  if (!data.upseCoupons) data.upseCoupons = [];
  if (!data.upseInvoices) data.upseInvoices = [];
  if (!data.upseWallets) data.upseWallets = [];
  if (!data.upseWalletTransactions) data.upseWalletTransactions = [];

  let modified = false;

  // 0. Seed Default Coupons
  if (data.upseCoupons.length === 0) {
    const coupons: UPSECoupon[] = [
      {
        id: 'cpn_WELCOME10',
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 1000,
        minBookingAmount: 1000,
        applicableModules: ['all'],
        validFrom: '2026-01-01T00:00:00Z',
        validUntil: '2027-12-31T23:59:59Z',
        usageLimit: 1000,
        usedCount: 14,
        isEnabled: true
      },
      {
        id: 'cpn_HILLY500',
        code: 'HILLY500',
        discountType: 'fixed_amount',
        discountValue: 500,
        minBookingAmount: 3500,
        applicableModules: ['homestay', 'taxi'],
        validFrom: '2026-01-01T00:00:00Z',
        validUntil: '2027-12-31T23:59:59Z',
        usageLimit: 500,
        usedCount: 28,
        isEnabled: true
      },
      {
        id: 'cpn_SUMMER2026',
        code: 'SUMMER2026',
        discountType: 'percentage',
        discountValue: 15,
        maxDiscountAmount: 2000,
        minBookingAmount: 4000,
        applicableModules: ['all'],
        validFrom: '2026-04-01T00:00:00Z',
        validUntil: '2026-09-30T23:59:59Z',
        usageLimit: 200,
        usedCount: 52,
        isEnabled: true
      }
    ];
    data.upseCoupons = coupons;
    modified = true;
  }


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

  // 4. Ensure payments array exists
  if (!data.upsePayments) {
    data.upsePayments = [];
    modified = true;
  }

  // 5. Ensure refunds array exists
  if (!data.upseRefunds) {
    data.upseRefunds = [];
    modified = true;
  }

  // 6. Ensure ledger array exists
  if (!data.upseLedger) {
    data.upseLedger = [];
    modified = true;
  }

  if (modified) {
    dbStore.save();
    console.log('[UPSE Engine] Initialization of financial configuration complete.');
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

export class CouponService {
  static getCoupons(): UPSECoupon[] {
    const data = (dbStore as any).data;
    return data.upseCoupons || [];
  }

  static validateCoupon(code: string, amount: number, moduleType?: string): { valid: boolean; discountAmount: number; coupon?: UPSECoupon; message: string } {
    const coupons = this.getCoupons();
    const cleanCode = (code || '').trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isEnabled);

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid or expired promo coupon code.' };
    }

    const now = new Date();
    if (new Date(coupon.validFrom) > now || new Date(coupon.validUntil) < now) {
      return { valid: false, discountAmount: 0, message: 'This coupon code is not currently active.' };
    }

    if (coupon.minBookingAmount && amount < coupon.minBookingAmount) {
      return { valid: false, discountAmount: 0, message: `Minimum booking amount of INR ${coupon.minBookingAmount} required for coupon ${cleanCode}.` };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, message: 'This coupon has reached its maximum usage limit.' };
    }

    if (moduleType && coupon.applicableModules && !coupon.applicableModules.includes('all') && !coupon.applicableModules.includes(moduleType)) {
      return { valid: false, discountAmount: 0, message: `Coupon ${cleanCode} is not applicable for ${moduleType}.` };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((amount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    if (discountAmount > amount) {
      discountAmount = amount;
    }

    return {
      valid: true,
      discountAmount,
      coupon,
      message: `Coupon ${cleanCode} applied! Saved INR ${discountAmount}`
    };
  }

  static createCoupon(couponData: Omit<UPSECoupon, 'id' | 'usedCount'>): UPSECoupon {
    const data = (dbStore as any).data;
    const newCoupon: UPSECoupon = {
      ...couponData,
      id: 'cpn_' + Math.random().toString(36).substring(2, 9),
      usedCount: 0
    };
    data.upseCoupons = data.upseCoupons || [];
    data.upseCoupons.push(newCoupon);
    dbStore.save();
    return newCoupon;
  }
}

export class InvoiceEngine {
  static generateInvoice(payment: UPSEPayment, extraDetails?: { businessName?: string; businessGstin?: string; travelerName?: string; travelerEmail?: string }): UPSEInvoice {
    const data = (dbStore as any).data;
    data.upseInvoices = data.upseInvoices || [];

    const existing = data.upseInvoices.find((i: UPSEInvoice) => i.paymentId === payment.id);
    if (existing) return existing;

    const invNum = `INV-HT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const subtotal = payment.amount;
    const taxAmount = payment.taxes || Math.round(subtotal * 0.18);
    const discountAmount = payment.metadata?.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoice: UPSEInvoice = {
      id: `inv_${Math.random().toString(36).substring(2, 9)}`,
      invoiceNumber: invNum,
      paymentId: payment.id,
      bookingId: payment.bookingId,
      businessId: payment.businessId,
      travelerId: payment.travelerId,
      travelerName: extraDetails?.travelerName || payment.metadata?.guestName || 'HillyTrip Traveler',
      travelerEmail: extraDetails?.travelerEmail || payment.travelerId,
      businessName: extraDetails?.businessName || 'HillyTrip Partner Operations',
      businessGstin: extraDetails?.businessGstin || '19AABCH1234F1Z1',
      items: [
        {
          description: payment.metadata?.reservation_name || payment.metadata?.itemDescription || `Travel Booking Reservation #${payment.bookingId}`,
          quantity: 1,
          unitPrice: subtotal,
          totalAmount: subtotal
        }
      ],
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      currency: payment.currency || 'INR',
      status: payment.status === 'captured' || payment.status === 'authorized' ? 'paid' : 'draft',
      issuedAt: new Date().toISOString(),
      dueDate: new Date().toISOString()
    };

    data.upseInvoices.push(invoice);
    dbStore.save();
    writeToInteractions('upse_invoice_generated', invoice.id, { invoice });
    return invoice;
  }

  static getInvoices(): UPSEInvoice[] {
    const data = (dbStore as any).data;
    return data.upseInvoices || [];
  }

  static getInvoiceById(id: string): UPSEInvoice | undefined {
    return this.getInvoices().find(i => i.id === id || i.invoiceNumber === id);
  }
}

export class WalletService {
  static getWallet(userId: string): { wallet: UPSEWallet; transactions: UPSEWalletTransaction[] } {
    const data = (dbStore as any).data;
    data.upseWallets = data.upseWallets || [];
    data.upseWalletTransactions = data.upseWalletTransactions || [];

    let wallet = data.upseWallets.find((w: UPSEWallet) => w.userId === userId);
    if (!wallet) {
      wallet = {
        id: `wlet_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        balance: 1500, // Seed default promo wallet balance for active demo users
        currency: 'INR',
        updatedAt: new Date().toISOString()
      };
      data.upseWallets.push(wallet);

      // Add welcome transaction
      data.upseWalletTransactions.push({
        id: `tx_${Math.random().toString(36).substring(2, 9)}`,
        walletId: wallet.id,
        userId,
        type: 'credit',
        amount: 1500,
        currency: 'INR',
        purpose: 'cashback',
        description: 'HillyTrip Welcome Travel Bonus Credit',
        createdAt: new Date().toISOString()
      });
      dbStore.save();
    }

    const transactions = data.upseWalletTransactions.filter((t: UPSEWalletTransaction) => t.userId === userId);
    return { wallet, transactions };
  }

  static topUpWallet(userId: string, amount: number, referencePaymentId?: string): { success: boolean; wallet: UPSEWallet; transaction: UPSEWalletTransaction } {
    const { wallet } = this.getWallet(userId);
    const data = (dbStore as any).data;

    wallet.balance += amount;
    wallet.updatedAt = new Date().toISOString();

    const transaction: UPSEWalletTransaction = {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      walletId: wallet.id,
      userId,
      type: 'credit',
      amount,
      currency: wallet.currency,
      purpose: 'topup',
      referenceId: referencePaymentId,
      description: `Added INR ${amount} to HillyTrip Wallet balance`,
      createdAt: new Date().toISOString()
    };

    data.upseWalletTransactions.push(transaction);
    dbStore.save();

    return { success: true, wallet, transaction };
  }

  static payWithWallet(userId: string, amount: number, bookingId: string): { success: boolean; wallet?: UPSEWallet; transaction?: UPSEWalletTransaction; message: string } {
    const { wallet } = this.getWallet(userId);

    if (wallet.balance < amount) {
      return { success: false, message: `Insufficient wallet balance. Available: INR ${wallet.balance}, Required: INR ${amount}` };
    }

    const data = (dbStore as any).data;
    wallet.balance -= amount;
    wallet.updatedAt = new Date().toISOString();

    const transaction: UPSEWalletTransaction = {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      walletId: wallet.id,
      userId,
      type: 'debit',
      amount,
      currency: wallet.currency,
      purpose: 'booking_payment',
      referenceId: bookingId,
      description: `Paid INR ${amount} for Booking #${bookingId}`,
      createdAt: new Date().toISOString()
    };

    data.upseWalletTransactions.push(transaction);
    dbStore.save();

    return { success: true, wallet, transaction, message: `Successfully paid INR ${amount} using HillyTrip Wallet.` };
  }
}

