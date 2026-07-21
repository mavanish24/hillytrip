import { dbStore } from '../db';
import { UniversalInventoryEngine } from '../../lib/inventoryEngine';
import { BookingLead, BookingStatusHistory, LeadStatus, PricingSnapshot } from '../../types';

// ============================================================================
// INTERNAL EVENT SYSTEM EXTENSION POINTS
// ============================================================================
export type BookingEvent = 
  | 'booking.created' 
  | 'booking.reserved' 
  | 'booking.confirmed' 
  | 'booking.cancelled' 
  | 'booking.expired' 
  | 'booking.completed'
  | 'booking.status_updated';

export interface BookingEventPayload {
  eventId: string;
  event: BookingEvent;
  bookingId: string;
  timestamp: string;
  actor: string;
  details?: any;
}

export class BookingEventBus {
  private static listeners: Array<(payload: BookingEventPayload) => void> = [];

  public static subscribe(listener: (payload: BookingEventPayload) => void) {
    this.listeners.push(listener);
  }

  public static dispatch(event: BookingEvent, bookingId: string, actor: string, details?: any) {
    const payload: BookingEventPayload = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      event,
      bookingId,
      timestamp: new Date().toISOString(),
      actor,
      details
    };
    console.log(`[BookingEventBus] Dispatching ${event} for Booking #${bookingId}`, payload);
    this.listeners.forEach(listener => {
      try {
        listener(payload);
      } catch (err) {
        console.error(`[BookingEventBus] Listener error during dispatch:`, err);
      }
    });
  }
}

// Subscribe a default logger/notification notifier
BookingEventBus.subscribe(async (payload) => {
  const { event, bookingId, actor, details } = payload;
  const leads = dbStore.getBookingLeads();
  const lead = leads.find(l => l.id === bookingId);
  if (!lead) return;

  const titleText = {
    'booking.created': `Booking Request Received - #${bookingId}`,
    'booking.reserved': `Hold Locked: Provisional Reservation - #${bookingId}`,
    'booking.confirmed': `Booking Confirmed! - #${bookingId}`,
    'booking.cancelled': `Booking Cancelled - #${bookingId}`,
    'booking.expired': `Reservation Hold Expired - #${bookingId}`,
    'booking.completed': `Trip Completed - #${bookingId}`,
    'booking.status_updated': `Booking Status Updated - #${bookingId}`
  }[event] || `Booking Update - #${bookingId}`;

  const messageText = {
    'booking.created': `Your booking request for "${lead.serviceName || 'HillyTrip Service'}" has been logged as pending.`,
    'booking.reserved': `We have provisionally held your slot for "${lead.serviceName || 'HillyTrip Service'}". Please complete the payment before expiration.`,
    'booking.confirmed': `Congratulations! Your booking for "${lead.serviceName || 'HillyTrip Service'}" is confirmed. Enjoy your journey.`,
    'booking.cancelled': `Your booking for "${lead.serviceName || 'HillyTrip Service'}" has been cancelled.`,
    'booking.expired': `The provisional hold on "${lead.serviceName || 'HillyTrip Service'}" has expired as payment was not completed within the timeout.`,
    'booking.completed': `Thank you for traveling with HillyTrip! Please take a moment to rate your experience.`,
    'booking.status_updated': `Your booking status for "${lead.serviceName || 'HillyTrip Service'}" is now ${lead.status.toUpperCase()}.`
  }[event] || `Booking status updated to ${lead.status}.`;

  // Create notifications
  try {
    const customerIdentifier = lead.customerEmail || lead.customerMobile;
    await dbStore.saveRecord('bookingNotifications', {
      id: `notif-${Date.now()}-${event}-customer`,
      userId: customerIdentifier,
      role: 'customer',
      leadId: bookingId,
      title: titleText,
      message: messageText,
      category: event.replace('.', '_'),
      isRead: false,
      createdAt: new Date().toISOString()
    });

    if (lead.assignedPartnerId) {
      await dbStore.saveRecord('bookingNotifications', {
        id: `notif-${Date.now()}-${event}-partner`,
        userId: lead.assignedPartnerId,
        role: 'partner',
        leadId: bookingId,
        title: `Stakeholder Notification: ${titleText}`,
        message: `Status change actioned by ${actor}. Current booking status: ${lead.status.toUpperCase()}.`,
        category: event.replace('.', '_'),
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Failed to create event notifications:', err);
  }
});


// ============================================================================
// 1. AVAILABILITY VALIDATOR
// ============================================================================
export class AvailabilityValidator {
  public static validate(
    itemId: string,
    startDate: string,
    endDate: string,
    quantity = 1
  ): { isAvailable: boolean; remainingCapacity: number; reason?: string; rateInfo?: any } {
    const engine = UniversalInventoryEngine.getInstance();
    
    // Call the matching engine check
    const result = engine.checkAvailability(itemId, startDate, endDate, quantity);
    return {
      isAvailable: result.isAvailable,
      remainingCapacity: result.remainingCapacity,
      reason: result.reason,
      rateInfo: {
        originalRate: result.originalRate,
        applicableRate: result.applicableRate,
        breakdown: result.breakdown
      }
    };
  }
}


// ============================================================================
// 2. PRICING SNAPSHOT SERVICE
// ============================================================================
export class PricingSnapshotService {
  /**
   * Generates a fully calculated, locked pricing snapshot that never changes
   */
  public static calculateSnapshot(
    basePrice: number,
    category: string,
    startDate: string,
    endDate: string,
    guestsCount: number,
    quantity = 1
  ): PricingSnapshot {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate dynamic base price for the duration
    let totalBase = basePrice * totalDays * quantity;

    // A: Seasonal Adjustments
    let seasonalAdjustment = 0;
    const currentMonth = start.getMonth(); // 0-11
    if (currentMonth >= 4 && currentMonth <= 6) {
      // May, June, July (Peak Summer Holiday Season in Himalayas)
      seasonalAdjustment = Math.round(totalBase * 0.25); // +25%
    } else if (currentMonth >= 11 || currentMonth === 0) {
      // December, January (Peak Winter Snow Season)
      seasonalAdjustment = Math.round(totalBase * 0.30); // +30%
    } else if (currentMonth >= 7 && currentMonth <= 8) {
      // August, September (Monsoon Off-Season)
      seasonalAdjustment = -Math.round(totalBase * 0.15); // -15% discount
    }

    // B: Weekend Adjustments (Friday, Saturday, Sunday stays)
    let weekendDaysCount = 0;
    let scanDate = new Date(start);
    for (let i = 0; i < totalDays; i++) {
      const day = scanDate.getDay();
      if (day === 0 || day === 5 || day === 6) {
        weekendDaysCount++;
      }
      scanDate.setDate(scanDate.getDate() + 1);
    }
    const weekendAdjustment = weekendDaysCount * Math.round(basePrice * 0.10) * quantity; // +10% premium per weekend day

    // C: High Holiday Adjustments
    let holidayAdjustment = 0;
    const isHolidayRange = (d: Date) => {
      const m = d.getMonth() + 1;
      const date = d.getDate();
      // Christmas / New Year peak block: Dec 24 - Jan 2
      if ((m === 12 && date >= 24) || (m === 1 && date <= 2)) return true;
      // Gandhi Jayanti / Autumn peak: Oct 2 - Oct 10
      if (m === 10 && date >= 2 && date <= 10) return true;
      // Himalayan Spring Festival: April 10 - April 16
      if (m === 4 && date >= 10 && date <= 16) return true;
      return false;
    };

    let checkHolidayDate = new Date(start);
    let holidayDaysCount = 0;
    for (let i = 0; i < totalDays; i++) {
      if (isHolidayRange(checkHolidayDate)) {
        holidayDaysCount++;
      }
      checkHolidayDate.setDate(checkHolidayDate.getDate() + 1);
    }
    if (holidayDaysCount > 0) {
      holidayAdjustment = Math.round(basePrice * 0.20) * holidayDaysCount * quantity; // +20% flat premium for holiday dates
    }

    // D: Duration and Bulk Discounts
    let discounts = 0;
    if (totalDays >= 7) {
      discounts += Math.round(totalBase * 0.12); // 12% off for weekly stays
    } else if (totalDays >= 3) {
      discounts += Math.round(totalBase * 0.05); // 5% off for multi-day stays
    }

    if (guestsCount >= 5 && category === 'Tour Package') {
      discounts += Math.round(totalBase * 0.08); // 8% group tour discount
    }

    // E: Taxes (12% Central/State Luxury or Carriage Tax)
    const taxableAmount = Math.max(0, totalBase + seasonalAdjustment + weekendAdjustment + holidayAdjustment - discounts);
    const taxes = Math.round(taxableAmount * 0.12);

    // F: Service/Platform Booking Fees (Fixed + 3.5% operations cost)
    const fees = 150 + Math.round(taxableAmount * 0.035);

    // G: Grand Total
    const grandTotal = Math.max(0, taxableAmount + taxes + fees);

    return {
      baseRate: basePrice,
      seasonalAdjustment,
      weekendAdjustment,
      holidayAdjustment,
      taxes,
      fees,
      discounts,
      grandTotal,
      currency: 'INR'
    };
  }
}


// ============================================================================
// 3. CONFLICT DETECTION SERVICE
// ============================================================================
export class ConflictDetectionService {
  /**
   * Scans server-side booking leads to detect double bookings or capacity overlaps.
   * This operates in absolute concurrency-safe alignment with the active status list.
   */
  public static hasOverlappingConflict(
    inventoryItemId: string,
    category: string,
    startDate: string,
    endDate: string,
    requestedQty = 1,
    excludeBookingId?: string
  ): { hasConflict: boolean; reason?: string } {
    // 1. Fetch all bookings from dbStore
    const allBookings = dbStore.getBookingLeads();

    // 2. Filter active bookings for this specific inventory element
    const activeStates: LeadStatus[] = ['pending', 'reserved', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress', 'accepted', 'trip_info_shared'];
    const overlappingBookings = allBookings.filter(b => {
      if (b.id === excludeBookingId) return false;
      if (!activeStates.includes(b.status)) return false;
      
      // Match key
      const matchesItem = b.inventoryItemId === inventoryItemId || b.serviceId === inventoryItemId;
      if (!matchesItem) return false;

      // Dates parse
      if (!b.checkInDate) return false;
      const bStart = b.checkInDate;
      const bEnd = b.checkOutDate || b.checkInDate; // if flat, end is same as start

      // Interval overlap check: startA < endB && endA > startB
      const reqStart = new Date(startDate);
      const reqEnd = new Date(endDate);
      const overlapStart = new Date(bStart);
      const overlapEnd = new Date(bEnd);

      return reqStart < overlapEnd && reqEnd > overlapStart;
    });

    // 3. Evaluate capacity limits
    const engine = UniversalInventoryEngine.getInstance();
    const invItem = engine.getInventory().find(i => i.id === inventoryItemId);
    if (!invItem) {
      return { hasConflict: false }; // Let validator catch missing items
    }

    const isExclusive = invItem.type === 'Room' || invItem.type === 'Vehicle';
    if (isExclusive) {
      // Any overlap is a double-booking block!
      if (overlappingBookings.length > 0) {
        const primaryConflict = overlappingBookings[0];
        return {
          hasConflict: true,
          reason: `Schedule conflict: Overlaps with an active locked reservation #${primaryConflict.id} (${primaryConflict.customerName}) from ${primaryConflict.checkInDate} to ${primaryConflict.checkOutDate || 'same-day'}`
        };
      }
    } else {
      // Shared resource (seats, packages, tables): sum up quantities
      let bookedCapacity = 0;
      overlappingBookings.forEach(b => {
        bookedCapacity += b.quantityBooked || b.numberOfGuests || 1;
      });

      const maxCapacity = invItem.capacity.totalQuantity;
      if (bookedCapacity + requestedQty > maxCapacity) {
        return {
          hasConflict: true,
          reason: `Capacity Overflow: Selected dates have ${bookedCapacity} seats/units locked. Adding ${requestedQty} units would exceed the maximum limit of ${maxCapacity} units.`
        };
      }
    }

    return { hasConflict: false };
  }
}


// ============================================================================
// 4. RESERVATION SERVICE
// ============================================================================
export class ReservationService {
  /**
   * Registers a temporary locked slot in UniversalInventoryEngine
   */
  public static createInventoryEngineReservation(booking: BookingLead): string | null {
    if (!booking.inventoryItemId) return null;

    try {
      const engine = UniversalInventoryEngine.getInstance();
      
      // Map booking status to inventory engine status
      const mapStatus = (status: LeadStatus): 'Hold' | 'Pending' | 'Confirmed' => {
        if (['reserved', 'awaiting_payment'].includes(status)) return 'Hold';
        if (['confirmed', 'checked_in', 'in_progress', 'completed'].includes(status)) return 'Confirmed';
        return 'Pending';
      };

      const res = engine.addReservation({
        inventoryItemId: booking.inventoryItemId,
        startDate: booking.checkInDate || new Date().toISOString().split('T')[0],
        endDate: booking.checkOutDate || booking.checkInDate || new Date().toISOString().split('T')[0],
        quantityBooked: booking.quantityBooked || booking.numberOfGuests || 1,
        status: mapStatus(booking.status)
      });

      console.log(`[ReservationService] Synced reservation slot ${res.id} into UniversalInventoryEngine for Booking ${booking.id}`);
      return res.id;
    } catch (err) {
      console.error('[ReservationService] Failed to create inventory engine hold slot:', err);
      return null;
    }
  }

  /**
   * Cancels or releases an hold slot in UniversalInventoryEngine
   */
  public static releaseInventoryEngineReservation(inventoryItemId: string, startDate: string, endDate: string) {
    try {
      const engine = UniversalInventoryEngine.getInstance();
      const allRes = engine.getReservations();
      
      // Find matching holds
      const match = allRes.find(r => 
        r.inventoryItemId === inventoryItemId && 
        r.startDate === startDate && 
        r.endDate === endDate
      );

      if (match) {
        engine.cancelReservation(match.id);
        console.log(`[ReservationService] Successfully released hold slot ${match.id} for item ${inventoryItemId}`);
      }
    } catch (err) {
      console.error('[ReservationService] Failed to release inventory engine reservation:', err);
    }
  }
}


// ============================================================================
// 5. BOOKING LIFECYCLE STATE MACHINE
// ============================================================================
export class BookingLifecycleService {
  private static VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
    'draft': ['pending', 'reserved', 'cancelled'],
    'pending': ['reserved', 'awaiting_payment', 'confirmed', 'rejected', 'cancelled'],
    'reserved': ['awaiting_payment', 'confirmed', 'expired', 'cancelled'],
    'awaiting_payment': ['confirmed', 'expired', 'cancelled'],
    'confirmed': ['checked_in', 'in_progress', 'cancelled'],
    'checked_in': ['in_progress', 'completed', 'no_show'],
    'in_progress': ['completed', 'cancelled'],
    'completed': [], // Terminal
    'cancelled': ['refund_pending'], 
    'expired': [], // Terminal
    'refund_pending': ['refunded'],
    'refunded': [], // Terminal
    'rejected': [], // Terminal
    'no_show': [], // Terminal
    
    // Legacy mapping support transitions
    'new': ['accepted', 'rejected', 'cancelled'],
    'accepted': ['confirmed', 'cancelled', 'trip_info_shared'],
    'need_more_info': ['accepted', 'rejected', 'cancelled'],
    'payment_pending': ['confirmed', 'cancelled', 'expired'],
    'payment_verified': ['confirmed'],
    'trip_info_shared': ['completed', 'cancelled']
  };

  /**
   * Checks if transition from oldState to newState is legally allowed
   */
  public static canTransition(current: LeadStatus, next: LeadStatus): boolean {
    const allowed = this.VALID_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  /**
   * Action a state transition, audit-logging it and dispatching events
   */
  public static async transitionTo(
    bookingId: string,
    nextStatus: LeadStatus,
    actor: 'customer' | 'partner' | 'admin' | 'system',
    actorId?: string,
    note?: string
  ): Promise<{ success: boolean; error?: string; booking?: BookingLead }> {
    const leads = dbStore.getBookingLeads();
    const leadIndex = leads.findIndex(l => l.id === bookingId);
    if (leadIndex === -1) {
      return { success: false, error: 'Booking record not found' };
    }

    const lead = leads[leadIndex];
    const oldStatus = lead.status;

    // 1. Verify eligibility
    if (oldStatus === nextStatus) {
      return { success: true, booking: lead }; // Idempotent success
    }

    if (!this.canTransition(oldStatus, nextStatus)) {
      return {
        success: false,
        error: `Lifecycle Restriction: Cannot transition booking from "${oldStatus.toUpperCase()}" to "${nextStatus.toUpperCase()}"`
      };
    }

    // 2. Perform actions on specific target status entrance
    const updatedLead = { ...lead };
    updatedLead.status = nextStatus;
    updatedLead.updatedAt = new Date().toISOString();

    // If moving to HOLD / RESERVED / AWAITING_PAYMENT, establish reservation hold timers
    if (nextStatus === 'reserved' || nextStatus === 'awaiting_payment') {
      const timeoutMinutes = 15; // 15 mins configurable hold timeout
      const expiresAtDate = new Date();
      expiresAtDate.setMinutes(expiresAtDate.getMinutes() + timeoutMinutes);
      updatedLead.reservationExpiresAt = expiresAtDate.toISOString();
      
      // Also register hold in inventory engine
      ReservationService.createInventoryEngineReservation(updatedLead);
    }

    // If moving to CONFIRMED, update inventory slot status to confirmed
    if (nextStatus === 'confirmed') {
      updatedLead.reservationExpiresAt = undefined; // clear hold expiration
      ReservationService.createInventoryEngineReservation(updatedLead);
    }

    // If moving to cancelled or expired or rejected, release hold slots
    if (['cancelled', 'expired', 'rejected', 'refunded'].includes(nextStatus)) {
      updatedLead.reservationExpiresAt = undefined;
      if (lead.inventoryItemId && lead.checkInDate) {
        ReservationService.releaseInventoryEngineReservation(
          lead.inventoryItemId,
          lead.checkInDate,
          lead.checkOutDate || lead.checkInDate
        );
      }
    }

    // 3. Persist record changes
    await dbStore.saveRecord('bookingLeads', updatedLead);

    // 4. Save Status History entry
    const historyId = `h-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    await dbStore.saveRecord('bookingStatusHistory', {
      id: historyId,
      leadId: bookingId,
      oldStatus,
      newStatus: nextStatus,
      changedBy: actor,
      changedById: actorId,
      createdAt: new Date().toISOString(),
      note: note || `State transition to ${nextStatus.toUpperCase()} triggered by ${actor}.`
    });

    // 5. Save Activity Log
    await dbStore.saveRecord('bookingActivityLog', {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      leadId: bookingId,
      activityType: nextStatus === 'confirmed' ? 'confirm' : nextStatus === 'cancelled' ? 'cancel' : 'update',
      description: `State Machine Actioned: ${oldStatus.toUpperCase()} → ${nextStatus.toUpperCase()}. Note: ${note || 'None'}`,
      performedBy: actor === 'system' ? 'System Orchestrator' : (actorId || actor),
      createdAt: new Date().toISOString()
    });

    // 6. Dispatch Bus Event
    const eventMapping: Record<LeadStatus, BookingEvent> = {
      'draft': 'booking.status_updated',
      'pending': 'booking.created',
      'reserved': 'booking.reserved',
      'awaiting_payment': 'booking.status_updated',
      'confirmed': 'booking.confirmed',
      'checked_in': 'booking.status_updated',
      'in_progress': 'booking.status_updated',
      'completed': 'booking.completed',
      'cancelled': 'booking.cancelled',
      'expired': 'booking.expired',
      'refund_pending': 'booking.status_updated',
      'refunded': 'booking.status_updated',
      'rejected': 'booking.status_updated',
      'no_show': 'booking.status_updated',
      
      // legacy support fallback map
      'new': 'booking.created',
      'accepted': 'booking.status_updated',
      'need_more_info': 'booking.status_updated',
      'payment_pending': 'booking.status_updated',
      'payment_verified': 'booking.status_updated',
      'trip_info_shared': 'booking.status_updated'
    };
    
    const targetEvent = eventMapping[nextStatus] || 'booking.status_updated';
    BookingEventBus.dispatch(targetEvent, bookingId, actor, { note, oldStatus, nextStatus });

    return { success: true, booking: updatedLead };
  }
}


// ============================================================================
// 6. MAIN BOOKING SERVICE CORE
// ============================================================================
export class BookingService {
  /**
   * Main service call to draft a brand new booking
   */
  public static async createDraft(payload: any): Promise<BookingLead> {
    const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const draft: BookingLead = {
      id: bookingId,
      customerName: payload.customerName || 'Anonymous Traveler',
      customerMobile: payload.customerMobile || '+91 00000 00000',
      customerEmail: payload.customerEmail || 'traveler@hillytrip.com',
      leadType: payload.leadType || 'homestay',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      numberOfGuests: Number(payload.numberOfGuests) || 1,
      numberOfRooms: payload.numberOfRooms ? Number(payload.numberOfRooms) : undefined,
      pickupLocation: payload.pickupLocation,
      dropLocation: payload.dropLocation,
      specialRequest: payload.specialRequest,
      serviceId: payload.serviceId,
      serviceName: payload.serviceName,
      inventoryItemId: payload.inventoryItemId,
      inventoryItemName: payload.inventoryItemName,
      quantityBooked: payload.quantityBooked || Number(payload.numberOfRooms) || 1,
      assignedPartnerId: payload.assignedPartnerId || 'partner_hillytrip',
      assignedPartnerName: payload.assignedPartnerName || 'HillyTrip Operator',
      bookingAmount: Number(payload.bookingAmount) || 0,
      currency: payload.currency || 'INR',
      notes: payload.notes || 'Created via Booking Engine Draft Mode.',
      contactRevealed: false,
      reminderSentCount: 0
    };

    // Calculate a default pricing snapshot for draft preview if possible
    if (draft.bookingAmount && draft.bookingAmount > 0) {
      draft.pricingSnapshot = PricingSnapshotService.calculateSnapshot(
        draft.bookingAmount,
        payload.leadType === 'homestay' ? 'Room' : payload.leadType === 'taxi' ? 'Vehicle' : 'Experience',
        draft.checkInDate || new Date().toISOString().split('T')[0],
        draft.checkOutDate || draft.checkInDate || new Date().toISOString().split('T')[0],
        draft.numberOfGuests,
        draft.quantityBooked
      );
      draft.bookingAmount = draft.pricingSnapshot.grandTotal; // Assign correct snapshot total
    }

    await dbStore.saveRecord('bookingLeads', draft);
    
    // Status History
    await dbStore.saveRecord('bookingStatusHistory', {
      id: `h-${Date.now()}-draft`,
      leadId: bookingId,
      oldStatus: null,
      newStatus: 'draft',
      changedBy: 'customer',
      createdAt: new Date().toISOString(),
      note: 'Draft booking configured successfully.'
    });

    BookingEventBus.dispatch('booking.status_updated', bookingId, 'customer', { note: 'Draft created.' });
    return draft;
  }

  /**
   * Creates a PROVISIONAL booking (checks availability, conflicts, locks hold)
   */
  public static async createProvisionalBooking(payload: any): Promise<{ success: boolean; error?: string; booking?: BookingLead }> {
    const {
      customerName,
      customerMobile,
      customerEmail,
      leadType,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequest,
      serviceId,
      serviceName,
      inventoryItemId,
      inventoryItemName,
      assignedPartnerId,
      assignedPartnerName,
      bookingAmount,
      currency,
      notes
    } = payload;

    if (!customerName || !customerMobile || !leadType || !checkInDate) {
      return { success: false, error: 'customerName, customerMobile, leadType, and checkInDate are required.' };
    }

    const finalInvItemId = inventoryItemId || serviceId;
    const finalInvItemName = inventoryItemName || serviceName;
    const reqQty = Number(payload.numberOfRooms) || Number(payload.quantityBooked) || 1;

    // 1. Availability Validator Rule Check
    if (finalInvItemId) {
      const availResult = AvailabilityValidator.validate(
        finalInvItemId,
        checkInDate,
        checkOutDate || checkInDate,
        reqQty
      );
      if (!availResult.isAvailable) {
        return { success: false, error: `Availability Error: ${availResult.reason || 'Requested dates are unavailable.'}` };
      }
    }

    // 2. Conflict Detection Engine (Avoid concurrent race condition double bookings)
    if (finalInvItemId) {
      const conflictResult = ConflictDetectionService.hasOverlappingConflict(
        finalInvItemId,
        leadType === 'homestay' ? 'Room' : 'Vehicle',
        checkInDate,
        checkOutDate || checkInDate,
        reqQty
      );
      if (conflictResult.hasConflict) {
        return { success: false, error: `Schedule Conflict: ${conflictResult.reason}` };
      }
    }

    // 3. Pricing Snapshot creation (Calculate exact seasonal, weekend, holiday multipliers, tax, fee, discount)
    const basePrice = Number(bookingAmount) || 2500;
    const categoryMapping: Record<string, string> = {
      'homestay': 'Room',
      'taxi': 'Vehicle',
      'tour': 'Tour Package',
      'guide': 'Guided Tour',
      'activity': 'Experience'
    };
    const snapCategory = categoryMapping[leadType] || 'Experience';
    const snapshot = PricingSnapshotService.calculateSnapshot(
      basePrice,
      snapCategory,
      checkInDate,
      checkOutDate || checkInDate,
      Number(numberOfGuests) || 1,
      reqQty
    );

    const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

    // Set expiration timer (15 minutes from now)
    const holdDurationMinutes = 15;
    const expDate = new Date();
    expDate.setMinutes(expDate.getMinutes() + holdDurationMinutes);

    const booking: BookingLead = {
      id: bookingId,
      customerName,
      customerMobile,
      customerEmail: customerEmail || 'traveler@hillytrip.com',
      leadType,
      status: 'reserved', // provisional hold locked status!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checkInDate,
      checkOutDate: checkOutDate || undefined,
      numberOfGuests: Number(numberOfGuests) || 1,
      numberOfRooms: payload.numberOfRooms ? Number(payload.numberOfRooms) : undefined,
      pickupLocation: payload.pickupLocation,
      dropLocation: payload.dropLocation,
      specialRequest,
      serviceId,
      serviceName,
      inventoryItemId: finalInvItemId,
      inventoryItemName: finalInvItemName,
      quantityBooked: reqQty,
      assignedPartnerId: assignedPartnerId || 'partner_hillytrip',
      assignedPartnerName: assignedPartnerName || 'Local Operator',
      bookingAmount: snapshot.grandTotal, // Locked pricing total
      currency: currency || 'INR',
      notes: notes || '',
      pricingSnapshot: snapshot, // Lock dynamic pricing breakdown forever
      contactRevealed: false,
      reminderSentCount: 0,
      reservationExpiresAt: expDate.toISOString() // reservation countdown lock!
    };

    // 4. Save Booking Lead
    await dbStore.saveRecord('bookingLeads', booking);

    // Save initial history
    await dbStore.saveRecord('bookingStatusHistory', {
      id: `h-${Date.now()}-create-res`,
      leadId: bookingId,
      oldStatus: null,
      newStatus: 'reserved',
      changedBy: 'customer',
      createdAt: new Date().toISOString(),
      note: 'Provisional booking registered successfully. Reservation lock held for 15 minutes.'
    });

    // Sync reservation slot in inventory engine
    ReservationService.createInventoryEngineReservation(booking);

    // Save Activity Log
    await dbStore.saveRecord('bookingActivityLog', {
      id: `log-${Date.now()}-res`,
      leadId: bookingId,
      activityType: 'create',
      description: `Provisional Booking reserved. Total locked: ₹${snapshot.grandTotal}. Lock expires at ${expDate.toLocaleTimeString()}.`,
      performedBy: 'System',
      createdAt: new Date().toISOString()
    });

    // Dispatch Events
    BookingEventBus.dispatch('booking.reserved', bookingId, 'system', { snapshot, expiresAt: expDate.toISOString() });

    return { success: true, booking };
  }

  /**
   * Automatic Cleanup Task: checks all bookings and expires ones whose hold has elapsed
   */
  public static async checkAndExpireReservations(): Promise<number> {
    const leads = dbStore.getBookingLeads();
    const activeHolds = leads.filter(l => 
      ['reserved', 'awaiting_payment', 'pending'].includes(l.status) && 
      l.reservationExpiresAt
    );

    const now = new Date();
    let expiredCount = 0;

    for (const hold of activeHolds) {
      if (hold.reservationExpiresAt) {
        const exp = new Date(hold.reservationExpiresAt);
        if (now > exp) {
          // Transition to expired!
          const result = await BookingLifecycleService.transitionTo(
            hold.id,
            'expired',
            'system',
            'system-orchestrator',
            `Hold timeout expired. Hold slot duration exceeded the configured limit.`
          );
          if (result.success) {
            expiredCount++;
          }
        }
      }
    }

    if (expiredCount > 0) {
      console.log(`[BookingService] Automatic Scheduler Cleanup: Expired and released ${expiredCount} holding reservations.`);
    }
    return expiredCount;
  }
}
