export type TaxiBookingStatus = 
  | 'pending'      // Pending Operator Response
  | 'accepted'     // Accepted by Operator
  | 'negotiating'  // Fare or Details being negotiated
  | 'confirmed'    // Confirmed by User & Operator
  | 'completed'    // Trip Completed
  | 'cancelled'    // Cancelled by User or Operator
  | 'rejected';    // Rejected / Declined by Operator

export interface TaxiBookingRequest {
  id: string;
  conversationId: string;
  operatorId: string;
  operatorName: string;
  operatorLogo?: string;
  operatorPhone?: string;
  vehicleId?: string;
  vehicleName: string;
  vehicleCategory?: string;
  vehicleImage?: string;
  fromLocation: string;
  toLocation: string;
  travelDate: string;
  pickupTime: string;
  passengers: number;
  pickupLocationDetail: string;
  dropLocationDetail: string;
  specialInstructions?: string;
  estimatedFare: number;
  agreedFare?: number;
  status: TaxiBookingStatus;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  rating?: number;
  reviewComment?: string;
}

export const TAXI_BOOKINGS_STORAGE_KEY = 'hillytrip_taxi_bookings_v2';

export function getLocalTaxiBookings(): TaxiBookingRequest[] {
  try {
    const raw = localStorage.getItem(TAXI_BOOKINGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading taxi bookings from storage:', e);
  }
  return [];
}

export function saveLocalTaxiBooking(booking: TaxiBookingRequest): void {
  try {
    const existing = getLocalTaxiBookings();
    const index = existing.findIndex((b) => b.id === booking.id);
    if (index >= 0) {
      existing[index] = booking;
    } else {
      existing.unshift(booking);
    }
    localStorage.setItem(TAXI_BOOKINGS_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Error saving taxi booking to storage:', e);
  }
}

export function updateTaxiBookingStatus(bookingId: string, newStatus: TaxiBookingStatus, updatedFare?: number): TaxiBookingRequest | null {
  try {
    const existing = getLocalTaxiBookings();
    const booking = existing.find((b) => b.id === bookingId);
    if (booking) {
      booking.status = newStatus;
      booking.updatedAt = new Date().toISOString();
      if (updatedFare !== undefined) {
        booking.agreedFare = updatedFare;
      }
      saveLocalTaxiBooking(booking);
      return booking;
    }
  } catch (e) {
    console.error('Error updating taxi booking status:', e);
  }
  return null;
}
