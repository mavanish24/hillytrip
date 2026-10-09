import { dbStore } from './db';
import { ClaimReminderLog, Homestay } from '../types';

export interface ProcessRemindersResult {
  timestamp: string;
  totalListingsChecked: number;
  unclaimedListingsCount: number;
  remindersSent: number;
  remindersSkipped: number;
  logs: ClaimReminderLog[];
  details: string[];
}

/**
 * Calculates the age of a listing in days based on its created_at or createdAt field.
 */
function getListingAgeInDays(listing: any): number {
  const dateStr = listing.created_at || listing.createdAt || listing.date_added || listing.dateAdded;
  if (!dateStr) return 0;
  const created = new Date(dateStr).getTime();
  if (isNaN(created)) return 0;
  const now = Date.now();
  const diffMs = now - created;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Determines which reminder milestone applies for a given age in days.
 */
function getApplicableMilestone(ageInDays: number): { milestone: 'Day 0' | 'Day 7' | 'Day 15' | 'Day 30'; dayNumber: number } | null {
  if (ageInDays >= 30) {
    return { milestone: 'Day 30', dayNumber: 30 };
  } else if (ageInDays >= 15) {
    return { milestone: 'Day 15', dayNumber: 15 };
  } else if (ageInDays >= 7) {
    return { milestone: 'Day 7', dayNumber: 7 };
  } else if (ageInDays >= 0) {
    return { milestone: 'Day 0', dayNumber: 0 };
  }
  return null;
}

/**
 * Formats email subject and content for specific milestone
 */
function generateReminderContent(listing: any, milestone: 'Day 0' | 'Day 7' | 'Day 15' | 'Day 30'): { subject: string; message: string } {
  const name = listing.name || listing.business_name || listing.title || 'Your Business';
  const location = listing.address || listing.district || listing.location || 'Himalayas';
  const listingType = listing.listing_type || listing.listingType || 'Homestay / Stay';

  switch (milestone) {
    case 'Day 0':
      return {
        subject: `[Action Required] Welcome to HillyTrip! Claim your official listing for ${name}`,
        message: `Dear Business Owner,\n\nCongratulations! ${name} is now listed on HillyTrip in ${location}. Travelers browsing mountain stays and local experiences can view your business.\n\nTo manage your direct inquiries, update photos, pricing, and display a 'Verified Local Host' badge, please claim your free listing now:\n\n👉 Claim Link: https://hillytrip.com/#/claim?id=${listing.id}\n\nWarm regards,\nThe HillyTrip Host Onboarding Team`
      };
    case 'Day 7':
      return {
        subject: `[HillyTrip Growth] Travelers are searching for ${name} - Claim your listing today`,
        message: `Hello ${name} Team,\n\nIt has been 7 days since ${name} was added to HillyTrip. Our network has recorded traveler interest for ${listingType} options in ${location}.\n\nBy claiming your listing, you gain full control over:\n- Direct guest phone & WhatsApp leads\n- Instant booking requests with 0% platform commission\n- Custom photo gallery and room availability management\n\n👉 Claim Your Listing in 1 Minute: https://hillytrip.com/#/claim?id=${listing.id}\n\nBest,\nHillyTrip Partner Relations`
      };
    case 'Day 15':
      return {
        subject: `[Direct Leads Waiting] Are you missing booking inquiries for ${name}?`,
        message: `Dear Owner of ${name},\n\nWe noticed your business listing remains unclaimed on HillyTrip. Potential guests searching for verified ${listingType} listings in ${location} cannot reach you directly until your mobile number is verified.\n\nClaiming takes less than 60 seconds using instant Mobile OTP verification:\n\n👉 Claim Now: https://hillytrip.com/#/claim?id=${listing.id}\n\nIf you need assistance, reply to this email or contact our host support.\n\nSincerely,\nHillyTrip Merchant Verification`
      };
    case 'Day 30':
    default:
      return {
        subject: `[Final Notice] Verify ownership of ${name} to secure your official HillyTrip badge`,
        message: `Important Notice for ${name},\n\nYour listing has been featured on HillyTrip for 30 days. To maintain database quality and protect traveler trust, unverified listings are scheduled for review.\n\nPlease complete your instant ownership claim to lock in your free verified profile and enjoy unlimited direct leads:\n\n👉 Complete Free Ownership Claim: https://hillytrip.com/#/claim?id=${listing.id}\n\nThank you for keeping Himalayan hospitality authentic and accessible!\n\nRegards,\nHillyTrip Verification & Trust Team`
      };
  }
}

/**
 * Evaluates all unclaimed listings and triggers email reminders for applicable milestones.
 */
export async function processClaimReminders(triggerType: 'automated_cron' | 'manual_admin' = 'automated_cron'): Promise<ProcessRemindersResult> {
  const now = new Date().toISOString();
  const existingLogs: ClaimReminderLog[] = dbStore.getClaimReminderLogs() || [];
  
  // Gather all homestays + taxi operators
  const homestays: Homestay[] = dbStore.getHomestays() || [];
  const taxiOperators: any[] = (dbStore as any).getTaxiOperators ? (dbStore as any).getTaxiOperators() : [];
  
  const allListings = [
    ...homestays.map(h => ({
      id: h.id,
      name: h.name,
      listing_type: 'Homestay',
      address: h.address,
      claim_status: h.claim_status || (h.ownerId ? 'CLAIMED' : 'UNCLAIMED'),
      created_at: (h as any).created_at || (h as any).createdAt || new Date().toISOString(),
      email: (h as any).email || (h as any).contactEmail || 'owner@hillytrip-unclaimed.com',
      mobile: (h as any).mobile || (h as any).phone || ''
    })),
    ...taxiOperators.map(t => ({
      id: t.id,
      name: t.business_name || (t as any).businessName || t.owner_name,
      listing_type: 'Taxi Operator',
      address: t.address || 'Himalayan Taxi Hub',
      claim_status: (t.verification_status === 'verified' ? 'CLAIMED' : 'UNCLAIMED'),
      created_at: t.created_at || new Date().toISOString(),
      email: t.email || 'operator@hillytrip-unclaimed.com',
      mobile: t.phone || t.mobile || ''
    }))
  ];

  const unclaimedListings = allListings.filter(l => l.claim_status === 'UNCLAIMED' || l.claim_status === 'PENDING');
  
  let remindersSent = 0;
  let remindersSkipped = 0;
  const details: string[] = [];
  const newlyCreatedLogs: ClaimReminderLog[] = [];

  for (const listing of unclaimedListings) {
    const ageInDays = getListingAgeInDays(listing);
    const targetMilestoneInfo = getApplicableMilestone(ageInDays);

    if (!targetMilestoneInfo) continue;

    const { milestone, dayNumber } = targetMilestoneInfo;

    // Check if a reminder for this listing and milestone has already been sent
    const alreadySent = existingLogs.some(
      log => log.listingId === listing.id && log.milestone === milestone && log.status === 'sent'
    );

    if (alreadySent) {
      remindersSkipped++;
      details.push(`Listing '${listing.name}' (${listing.id}) - ${milestone} reminder already sent previously. Skipped.`);
      continue;
    }

    // Generate email subject and content
    const { subject, message } = generateReminderContent(listing, milestone);

    const logEntry: ClaimReminderLog = {
      id: `rem-log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      listingId: listing.id,
      listingName: listing.name,
      listingType: listing.listing_type,
      recipientEmail: listing.email,
      recipientMobile: listing.mobile,
      milestone: milestone,
      milestoneDay: dayNumber,
      subject,
      message,
      sentAt: now,
      status: 'sent',
      triggerType
    };

    // Save record to DB store
    await dbStore.saveRecord('claim_reminder_logs', logEntry);
    newlyCreatedLogs.push(logEntry);
    remindersSent++;

    details.push(`[${milestone}] Dispatched reminder email to '${listing.name}' (${listing.email}). Subject: "${subject}"`);

    // Record audit log
    dbStore.addAuditLog({
      id: `log-${Date.now()}`,
      userId: 'system_claim_cron',
      email: 'cron@hillytrip.com',
      action: 'Claim Reminder Email Dispatched',
      details: `Triggered ${milestone} email reminder for unclaimed listing '${listing.name}' (${listing.id}) via ${triggerType}`,
      timestamp: now
    });
  }

  return {
    timestamp: now,
    totalListingsChecked: allListings.length,
    unclaimedListingsCount: unclaimedListings.length,
    remindersSent,
    remindersSkipped,
    logs: newlyCreatedLogs,
    details
  };
}

let cronIntervalId: NodeJS.Timeout | null = null;

/**
 * Initializes the automated claim reminder cron timer.
 * Runs every 6 hours automatically.
 */
export function initClaimReminderCron(intervalHours: number = 6): void {
  if (cronIntervalId) {
    clearInterval(cronIntervalId);
  }

  const ms = intervalHours * 60 * 60 * 1000;
  console.log(`[Claim Reminder Cron] Initializing automated claim reminder cron service (Interval: ${intervalHours} hours)...`);

  // Run initial pass after 15 seconds on startup
  setTimeout(() => {
    processClaimReminders('automated_cron')
      .then(res => {
        console.log(`[Claim Reminder Cron Startup Run] Processed ${res.totalListingsChecked} listings. Sent ${res.remindersSent} claim reminders.`);
      })
      .catch(err => {
        console.error('[Claim Reminder Cron Startup Error]', err);
      });
  }, 15000);

  cronIntervalId = setInterval(() => {
    console.log('[Claim Reminder Cron Scheduled Trigger] Running scheduled scan for Day 0, 7, 15, 30 unclaimed reminders...');
    processClaimReminders('automated_cron')
      .then(res => {
        console.log(`[Claim Reminder Cron Scheduled Run] Sent ${res.remindersSent} reminders.`);
      })
      .catch(err => {
        console.error('[Claim Reminder Cron Scheduled Run Error]', err);
      });
  }, ms);
}
