export type UPSEPaymentFlow =
  | 'full'
  | 'partial'
  | 'advance'
  | 'pay_at_property'
  | 'pay_at_pickup'
  | 'split'
  | 'wallet'
  | 'gift_card'
  | 'refund'
  | 'emi';

export type UPSEPaymentProvider =
  | 'razorpay'
  | 'cashfree'
  | 'phonepe'
  | 'stripe'
  | 'paypal'
  | 'custom_stub';

export type UPSEPaymentStatus =
  | 'draft'
  | 'payment_initiated'
  | 'authorization_pending'
  | 'authorized'
  | 'captured'
  | 'partially_captured'
  | 'failed'
  | 'expired'
  | 'refund_pending'
  | 'refunded'
  | 'partially_refunded'
  | 'chargeback'
  | 'disputed'
  | 'cancelled';

export type UPSESettlementType =
  | 'instant'
  | 'scheduled'
  | 'manual'
  | 'weekly'
  | 'monthly';

export type UPSECommissionType =
  | 'zero'
  | 'percentage'
  | 'fixed_fee'
  | 'business_specific'
  | 'category_specific'
  | 'campaign_based'
  | 'future_partner';

export type UPSECancellationPolicyType =
  | 'flexible' // Full refund up to 24h
  | 'moderate' // Full refund up to 72h, 50% after
  | 'strict'   // No refund after booking confirmation
  | 'custom';

export interface UPSEPayment {
  id: string;
  bookingId: string;
  businessId: string;
  travelerId: string;
  provider: UPSEPaymentProvider;
  providerTransactionId?: string;
  amount: number;
  currency: string;
  taxes: number;
  fees: number;
  commission: number;
  settlementAmount: number;
  status: UPSEPaymentStatus;
  paymentFlow: UPSEPaymentFlow;
  auditHistory: Array<{
    status: UPSEPaymentStatus;
    updatedBy: string;
    timestamp: string;
    note?: string;
  }>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UPSESettlementRule {
  id: string;
  businessId: string;
  settlementType: UPSESettlementType;
  payoutBankAccountId: string;
  isEnabled: boolean;
  frequencyDetail?: string; // e.g., "friday", "1st of month"
  updatedAt: string;
}

export interface UPSECommissionRule {
  id: string;
  entityType: string; // 'homestay' | 'taxi' | 'guide' | 'restaurant'
  commissionType: UPSECommissionType;
  value: number; // Percentage or flat fee amount
  campaignCode?: string;
  businessId?: string; // If business-specific override
  isEnabled: boolean;
}

export interface UPSERefund {
  id: string;
  paymentId: string;
  bookingId: string;
  amount: number;
  reason: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'processed' | 'failed';
  approvedBy?: string;
  notes?: string;
  auditTrail: Array<{
    action: string;
    actor: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UPSERefundPolicyRule {
  policyType: UPSECancellationPolicyType;
  refundablePercentageBeforeDays: Array<{
    daysBefore: number;
    refundPercentage: number;
  }>;
  description: string;
}

export interface UPSEPayoutAccount {
  id: string;
  businessId: string;
  bankName: string;
  accountNumber: string;
  routingNumberOrIfsc: string;
  accountHolderName: string;
  isPrimary: boolean;
  payoutType: 'bank' | 'upi';
  upiId?: string;
}

export interface UPSELedgerEntry {
  id: string;
  paymentId?: string;
  refundId?: string;
  settlementId?: string;
  businessId: string;
  type: 'credit' | 'debit';
  category: 'payment' | 'refund' | 'settlement' | 'adjustment' | 'fee' | 'commission';
  amount: number;
  currency: string;
  description: string;
  isImmutable: boolean;
  createdAt: string;
}
