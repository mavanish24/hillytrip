import { ClaimStatus, ClaimSource, ClaimPlatform, Homestay } from '../types';

export interface BusinessListingItem {
  id: string;
  name: string;
  type?: string;
  destinationId?: string;
  location?: string;
  ownerId?: string | null;
  owner_user_id?: string | null;
  ownerName?: string;
  claim_status?: ClaimStatus;
  verified?: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  claimed_at?: string | null;
  verified_at?: string | null;
  claimed_from?: ClaimPlatform;
  claim_source?: ClaimSource;
  image?: string;
  images?: string[];
  priceMin?: number;
  contact?: string;
  mobile?: string;
}

export interface InstantClaimPayload {
  listingId: string;
  listingName: string;
  listingType?: string;
  ownerUserId: string;
  ownerName: string;
  mobile: string;
  email: string;
  whatsapp?: string;
  claimedFrom?: ClaimPlatform;
  claimSource?: ClaimSource;
}

// Global state store for claimed items in current session
const claimedRegistryKey = 'hillytrip_claimed_business_registry_v1';
const PENDING_CLAIM_KEY = 'hillytrip_pending_claim_v1';

export interface PendingClaimState {
  listingId: string;
  listingName: string;
  listingType?: string;
  ownerName: string;
  mobile: string;
  email: string;
  role?: string;
  documentType?: string;
  ownershipProof?: string;
  message?: string;
  claimSource?: ClaimSource;
  timestamp: number;
}

export interface SubmitClaimPayload {
  listingId: string;
  listingName: string;
  listingType?: string;
  ownerName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  role?: string;
  documentType?: string;
  ownershipProof?: string;
  message?: string;
  claimSource?: ClaimSource;
}

/**
 * Submits an authentic business claim with ownership proof for administrative review (BC-5 Flow).
 * Creates a PENDING claim request. Does NOT grant instant ownership or verified badge.
 */
export async function submitClaimRequest(payload: SubmitClaimPayload): Promise<{ success: boolean; claim: any; message: string }> {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('hillytrip_token') || localStorage.getItem('hillytrip_admin_token') || '') : '';

  const res = await fetch('/api/partner/claims', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    credentials: 'include',
    body: JSON.stringify({
      homestayId: payload.listingId,
      listingId: payload.listingId,
      listingName: payload.listingName,
      listingType: payload.listingType || 'Homestay',
      ownerName: payload.ownerName,
      mobile: payload.mobile,
      whatsapp: payload.whatsapp || payload.mobile,
      email: payload.email,
      role: payload.role,
      documentType: payload.documentType || 'ownership_proof',
      ownershipProof: payload.ownershipProof || '',
      message: payload.message || `Claim request with ownership proof for ${payload.listingName}`,
      claimSource: payload.claimSource || 'Listing Page'
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Claim submission failed with status ${res.status}`);
  }

  const data = await res.json();
  clearPendingClaim();
  notifySubscribers();
  return data;
}

export function savePendingClaim(claim: Omit<PendingClaimState, 'timestamp'>) {
  try {
    const payload: PendingClaimState = {
      ...claim,
      timestamp: Date.now()
    };
    sessionStorage.setItem(PENDING_CLAIM_KEY, JSON.stringify(payload));
  } catch (e) {}
}

export function getPendingClaim(): PendingClaimState | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CLAIM_KEY);
    if (!raw) return null;
    const parsed: PendingClaimState = JSON.parse(raw);
    // Expire pending claim after 24 hours to prevent stale resumption
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      clearPendingClaim();
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

export function clearPendingClaim() {
  try {
    sessionStorage.removeItem(PENDING_CLAIM_KEY);
  } catch (e) {}
}

function getRegistry(): Record<string, {
  claim_status: ClaimStatus;
  verified: boolean;
  owner_user_id: string;
  ownerName: string;
  mobile: string;
  claimed_at: string;
  verified_at: string;
  claimed_from: ClaimPlatform;
  claim_source: ClaimSource;
}> {
  try {
    const raw = localStorage.getItem(claimedRegistryKey);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveRegistry(registry: Record<string, any>) {
  try {
    localStorage.setItem(claimedRegistryKey, JSON.stringify(registry));
  } catch (e) {}
}

// Event subscribers
type ClaimSubscriber = () => void;
const subscribers: Set<ClaimSubscriber> = new Set();

export function subscribeClaimSystem(callback: ClaimSubscriber): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers() {
  subscribers.forEach(cb => {
    try { cb(); } catch (e) {}
  });
  // Dispatch custom window event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hillytrip_claim_updated'));
  }
}

/**
 * Checks if a listing is verified.
 * RULE: Never show the VERIFIED badge on an unclaimed listing.
 * Verification is earned ONLY after a successful claim.
 */
export function isListingVerified(item: Partial<BusinessListingItem> | null | undefined): boolean {
  if (!item || !item.id) return false;
  
  const registry = getRegistry();
  const regItem = registry[item.id];
  
  if (regItem) {
    if (regItem.claim_status === 'SUSPENDED') return false;
    return regItem.claim_status === 'CLAIMED' && regItem.verified === true;
  }

  const claimStatus = getClaimStatus(item);
  if (claimStatus !== 'CLAIMED') return false;

  return item.verified === true || item.isVerified === true;
}

/**
 * Gets the claim_status for any listing.
 */
export function getClaimStatus(item: Partial<BusinessListingItem> | null | undefined): ClaimStatus {
  if (!item || !item.id) return 'UNCLAIMED';

  const registry = getRegistry();
  if (registry[item.id]) {
    return registry[item.id].claim_status;
  }

  if (item.claim_status) return item.claim_status;

  // If owner_user_id or ownerId is set with valid value, it is CLAIMED
  if (item.owner_user_id || (item.ownerId && item.ownerId.trim() !== '')) {
    return 'CLAIMED';
  }

  return 'UNCLAIMED';
}

/**
 * Deprecated legacy method - routes to safe submitClaimRequest for BC-5 flow.
 */
export async function claimBusinessLocally(payload: InstantClaimPayload): Promise<boolean> {
  try {
    await submitClaimRequest({
      listingId: payload.listingId,
      listingName: payload.listingName,
      listingType: payload.listingType,
      ownerName: payload.ownerName,
      mobile: payload.mobile,
      whatsapp: payload.whatsapp,
      email: payload.email,
      claimSource: payload.claimSource
    });
    return true;
  } catch (e: any) {
    console.error('[ClaimSystem] Claim request error:', e);
    throw e;
  }
}

/**
 * Admin action to unclaim or suspend a business listing.
 */
export async function updateClaimStatusAdmin(
  listingId: string,
  newStatus: ClaimStatus,
  newOwnerUserId: string | null = null
) {
  const registry = getRegistry();

  if (newStatus === 'UNCLAIMED') {
    delete registry[listingId];
  } else if (registry[listingId]) {
    registry[listingId].claim_status = newStatus;
    if (newOwnerUserId) {
      registry[listingId].owner_user_id = newOwnerUserId;
    }
  } else {
    registry[listingId] = {
      claim_status: newStatus,
      verified: newStatus === 'CLAIMED',
      owner_user_id: newOwnerUserId || 'admin',
      ownerName: 'Assigned Owner',
      mobile: '',
      claimed_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      claimed_from: 'Web',
      claim_source: 'Direct Link'
    };
  }

  saveRegistry(registry);
  notifySubscribers();
}

/**
 * Simulated automated reminder log for unclaimed listings
 */
export interface ClaimReminderLog {
  day: number;
  label: string;
  subject: string;
  message: string;
  status: 'sent' | 'scheduled';
}

export function getClaimRemindersLog(listingName: string): ClaimReminderLog[] {
  return [
    {
      day: 0,
      label: 'Day 0 - Welcome',
      subject: `Your business "${listingName}" is now listed on HillyTrip!`,
      message: 'Claim your FREE profile to unlock direct bookings, verified status, and guest analytics.',
      status: 'sent'
    },
    {
      day: 7,
      label: 'Day 7 - First Follow Up',
      subject: `Travelers are viewing "${listingName}" on HillyTrip`,
      message: 'Claim your listing in under 1 minute using your mobile number to start receiving inquiries.',
      status: 'sent'
    },
    {
      day: 15,
      label: 'Day 15 - Growth Digest',
      subject: `Don't miss guest inquiries for "${listingName}"`,
      message: 'Verified listings get 3.8x more bookings. Claim now for free.',
      status: 'scheduled'
    },
    {
      day: 30,
      label: 'Day 30 - Final Notice',
      subject: `Final Reminder: Verify your ownership of "${listingName}"`,
      message: 'Secure your official HillyTrip Verified badge today.',
      status: 'scheduled'
    }
  ];
}
